import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['match', 'claim', 'recovery', 'report'], required: true },
  message: { type: String, required: true, trim: true, maxlength: 300 },
  relatedItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  isRead: { type: Boolean, default: false, index: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
