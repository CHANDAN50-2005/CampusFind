import mongoose from 'mongoose';
import Item from '../models/Item.js';
import Match from '../models/Match.js';
import Notification from '../models/Notification.js';

const itemFields = 'itemName type category description location dateOfIncident imageUrl status createdAt';

export async function listMatches(request, response, next) {
  try {
    const owned = await Item.find({ userId: request.user._id }).select('_id').lean();
    const ids = owned.map((item) => item._id);
    const filter = { $or: [{ lostItemId: { $in: ids } }, { foundItemId: { $in: ids } }] };
    if (request.query.status && ['suggested', 'dismissed', 'confirmed', 'resolved'].includes(request.query.status)) filter.status = request.query.status;
    else filter.status = { $in: ['suggested', 'confirmed'] };
    const matches = await Match.find(filter).sort({ score: -1, updatedAt: -1 }).limit(100)
      .populate('lostItemId', itemFields).populate('foundItemId', itemFields).lean();
    return response.json({ matches });
  } catch (error) {
    return next(error);
  }
}

export async function updateMatchStatus(request, response, next) {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) return response.status(404).json({ message: 'Match not found.' });
    const status = request.body.status;
    if (!['dismissed', 'confirmed'].includes(status)) return response.status(400).json({ message: 'Invalid match action.' });
    const match = await Match.findById(request.params.id);
    if (!match) return response.status(404).json({ message: 'Match not found.' });
    const [lost, found] = await Promise.all([Item.findById(match.lostItemId), Item.findById(match.foundItemId)]);
    const isParticipant = [lost, found].some((item) => item && String(item.userId) === String(request.user._id));
    if (!isParticipant && request.user.role !== 'admin') return response.status(404).json({ message: 'Match not found.' });
    if (match.status === 'resolved') return response.status(409).json({ message: 'This match is already resolved.' });
    match.status = status;
    await match.save();
    if (status === 'confirmed') {
      const otherItem = lost && String(lost.userId) === String(request.user._id) ? found : lost;
      if (otherItem) await Notification.create({ userId: otherItem.userId, type: 'match', relatedItemId: otherItem._id, message: 'Another student confirmed a possible match for a report.' });
    }
    return response.json({ match });
  } catch (error) {
    return next(error);
  }
}
