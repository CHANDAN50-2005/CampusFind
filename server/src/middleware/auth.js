import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function readSession(request) {
  const token = request.cookies?.campusfind_session;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret || secret === 'replace-with-a-long-random-secret') return null;
  try { return jwt.verify(token, secret); } catch { return null; }
}

export async function attachOptionalUser(request, _response, next) {
  const payload = readSession(request);
  if (!payload?.sub) return next();
  try {
    request.user = await User.findById(payload.sub).select('_id name email role');
    return next();
  } catch (error) { return next(error); }
}

export async function requireAuth(request, response, next) {
  const token = request.cookies?.campusfind_session;
  if (!token) return response.status(401).json({ message: 'Please sign in to continue.' });
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'replace-with-a-long-random-secret') return response.status(503).json({ message: 'Authentication is not configured on this server.' });

  let payload;
  try { payload = jwt.verify(token, secret); }
  catch { return response.status(401).json({ message: 'Your session is invalid or has expired. Please sign in again.' }); }

  try {
    const user = await User.findById(payload.sub).select('_id name email role');
    if (!user) return response.status(401).json({ message: 'Your session is no longer valid. Please sign in again.' });
    request.user = user;
    return next();
  } catch (error) { return next(error); }
}

export function requireAdmin(request, response, next) {
  if (request.user?.role !== 'admin') return response.status(403).json({ message: 'Administrator access is required.' });
  return next();
}
