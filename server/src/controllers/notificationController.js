import mongoose from 'mongoose';
import Notification from '../models/Notification.js';

export async function listNotifications(request, response, next) {
  try {
    const page = Math.max(1, Number.parseInt(request.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(request.query.limit, 10) || 20));
    const [notifications, unread] = await Promise.all([
      Notification.find({ userId: request.user._id }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Notification.countDocuments({ userId: request.user._id, isRead: false }),
    ]);
    return response.json({ notifications, unread });
  } catch (error) {
    return next(error);
  }
}

export async function markNotificationRead(request, response, next) {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) return response.status(404).json({ message: 'Notification not found.' });
    const notification = await Notification.findOneAndUpdate(
      { _id: request.params.id, userId: request.user._id },
      { $set: { isRead: true } },
      { returnDocument: 'after' },
    ).lean();
    if (!notification) return response.status(404).json({ message: 'Notification not found.' });
    return response.json({ notification });
  } catch (error) {
    return next(error);
  }
}

