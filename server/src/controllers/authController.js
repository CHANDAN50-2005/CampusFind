import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const COOKIE_NAME = 'campusfind_session';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function authCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ONE_DAY_MS,
  };
}

function setSessionCookie(response, userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'replace-with-a-long-random-secret' || Buffer.byteLength(secret, 'utf8') < 32) {
    throw new Error('JWT_SECRET must be configured with a strong random value.');
  }

  const token = jwt.sign({}, secret, {
    subject: String(userId),
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
  response.cookie(COOKIE_NAME, token, authCookieOptions());
}

function safeUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function register(request, response, next) {
  try {
    const name = typeof request.body.name === 'string' ? request.body.name.trim() : '';
    const email = typeof request.body.email === 'string' ? request.body.email.trim().toLowerCase() : '';
    const password = typeof request.body.password === 'string' ? request.body.password : '';

    if (name.length < 2 || name.length > 80) {
      return response.status(400).json({ message: 'Name must be between 2 and 80 characters.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return response.status(400).json({ message: 'Enter a valid email address.' });
    }
    if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
      return response.status(400).json({ message: 'Password must be at least 8 characters and no more than 72 bytes.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash, role: 'student' });
    setSessionCookie(response, user._id);
    return response.status(201).json({ user: safeUser(user) });
  } catch (error) {
    if (error?.code === 11000) {
      return response.status(409).json({ message: 'An account with that email already exists.' });
    }
    if (error?.name === 'ValidationError') {
      return response.status(400).json({ message: 'Please check your details and try again.' });
    }
    return next(error);
  }
}

export async function login(request, response, next) {
  try {
    const email = typeof request.body.email === 'string' ? request.body.email.trim().toLowerCase() : '';
    const password = typeof request.body.password === 'string' ? request.body.password : '';
    if (!email || !password) {
      return response.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email }).select('+passwordHash');
    const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!passwordMatches) {
      return response.status(401).json({ message: 'Email or password is incorrect.' });
    }

    setSessionCookie(response, user._id);
    return response.json({ user: safeUser(user) });
  } catch (error) {
    return next(error);
  }
}

export function logout(_request, response) {
  response.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  return response.status(204).end();
}

export function currentUser(request, response) {
  return response.json({ user: safeUser(request.user) });
}
