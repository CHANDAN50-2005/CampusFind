import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 80,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 254,
    index: true,
  },
  passwordHash: {
    type: String,
    required: true,
    select: false,
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student',
    required: true,
  },
}, { timestamps: true });

userSchema.set('toJSON', {
  transform(_document, output) {
    delete output.passwordHash;
    delete output.__v;
    return output;
  },
});

const User = mongoose.model('User', userSchema);

export default User;
