import mongoose from 'mongoose';
import Claim from '../models/Claim.js';
import Item from '../models/Item.js';
import Match from '../models/Match.js';
import Notification from '../models/Notification.js';

const claimItemFields = 'itemName type category location dateOfIncident imageUrl status userId';

function isTransactionUnsupported(error) {
  return error?.code === 20 || error?.codeName === 'IllegalOperation' || /transaction numbers are only allowed/i.test(error?.message || '');
}

async function approveWithoutTransactions(claim, item, reviewerId) {
  const changedAt = new Date();
  const changedItem = await Item.findOneAndUpdate(
    { _id: item._id, status: { $nin: ['returned', 'closed'] } },
    { $set: { status: 'returned', returnedAt: changedAt } },
    { returnDocument: 'after' },
  );
  if (!changedItem) {
    const conflict = new Error('This report can no longer be returned.');
    conflict.status = 409;
    throw conflict;
  }

  const approved = await Claim.findOneAndUpdate(
    { _id: claim._id, status: 'pending' },
    { $set: { status: 'approved', reviewedBy: reviewerId } },
    { returnDocument: 'after' },
  );
  if (!approved) {
    await Item.updateOne(
      { _id: item._id, status: 'returned', returnedAt: changedAt },
      { $set: { status: item.status, returnedAt: item.returnedAt || null } },
    );
    const conflict = new Error('This claim has already been reviewed.');
    conflict.status = 409;
    throw conflict;
  }

  const otherClaims = await Claim.find({ itemId: item._id, _id: { $ne: claim._id }, status: 'pending' }).select('_id claimantId').lean();
  let notices = [];
  try {
    if (otherClaims.length) {
      await Claim.updateMany({ _id: { $in: otherClaims.map((entry) => entry._id) }, status: 'pending' }, { $set: { status: 'rejected', reviewedBy: reviewerId } });
    }
    notices = await Notification.insertMany([
      { userId: approved.claimantId, type: 'claim', relatedItemId: item._id, message: 'Your ownership claim was approved. The report is marked returned.' },
      ...otherClaims.map((entry) => ({ userId: entry.claimantId, type: 'claim', relatedItemId: item._id, message: 'Another claim was approved for this report.' })),
    ]);
    await Match.updateMany(
      { $or: [{ lostItemId: item._id }, { foundItemId: item._id }], status: { $in: ['suggested', 'confirmed'] } },
      { $set: { status: 'resolved' } },
    );
  } catch (error) {
    await Notification.deleteMany({ _id: { $in: notices.map((notice) => notice._id) } }).catch(() => {});
    if (otherClaims.length) await Claim.updateMany({ _id: { $in: otherClaims.map((entry) => entry._id) }, status: 'rejected', reviewedBy: reviewerId }, { $set: { status: 'pending', reviewedBy: null } }).catch(() => {});
    await Claim.updateOne({ _id: approved._id, status: 'approved', reviewedBy: reviewerId }, { $set: { status: 'pending', reviewedBy: null } }).catch(() => {});
    await Item.updateOne({ _id: item._id, status: 'returned', returnedAt: changedAt }, { $set: { status: item.status, returnedAt: item.returnedAt || null } }).catch(() => {});
    throw error;
  }

  return Claim.findById(approved._id).populate('itemId', claimItemFields).populate('claimantId', 'name email').lean();
}
export async function createClaim(request, response, next) {
  try {
    const itemId = request.body.itemId;
    const message = typeof request.body.message === 'string' ? request.body.message.trim() : '';
    if (!mongoose.isValidObjectId(itemId)) return response.status(400).json({ message: 'Choose a valid report.' });
    if (message.length < 10 || message.length > 1200) return response.status(400).json({ message: 'Claim message must be between 10 and 1,200 characters.' });

    const item = await Item.findById(itemId);
    if (!item || !['open', 'matched', 'claimed'].includes(item.status)) return response.status(404).json({ message: 'This report is not accepting claims.' });
    if (String(item.userId) === String(request.user._id)) return response.status(403).json({ message: 'You cannot claim your own report.' });

    const claim = await Claim.create({ itemId: item._id, claimantId: request.user._id, message });
    if (item.status === 'open' || item.status === 'matched') {
      item.status = 'claimed';
      await item.save();
    }
    await Notification.create({
      userId: item.userId,
      type: 'claim',
      relatedItemId: item._id,
      message: 'A student submitted an ownership claim for your report.',
    });
    return response.status(201).json({ claim: await Claim.findById(claim._id).populate('itemId', claimItemFields).lean() });
  } catch (error) {
    if (error?.code === 11000) return response.status(409).json({ message: 'You have already submitted a claim for this report.' });
    if (error?.name === 'ValidationError') return response.status(400).json({ message: 'Check your claim details and try again.' });
    return next(error);
  }
}

export async function listMyClaims(request, response, next) {
  try {
    const ownedItems = await Item.find({ userId: request.user._id }).select('_id').lean();
    const itemIds = ownedItems.map((item) => item._id);
    const [sent, received] = await Promise.all([
      Claim.find({ claimantId: request.user._id }).sort({ createdAt: -1 }).limit(100).populate('itemId', claimItemFields).lean(),
      Claim.find({ itemId: { $in: itemIds }, claimantId: { $ne: request.user._id } }).sort({ createdAt: -1 }).limit(100)
        .populate('itemId', claimItemFields).populate('claimantId', 'name email').lean(),
    ]);
    return response.json({ sent, received });
  } catch (error) {
    return next(error);
  }
}

export async function getClaim(request, response, next) {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) return response.status(404).json({ message: 'Claim not found.' });
    const claim = await Claim.findById(request.params.id).populate('itemId', claimItemFields).populate('claimantId', 'name email').lean();
    if (!claim) return response.status(404).json({ message: 'Claim not found.' });
    const ownsItem = String(claim.itemId.userId) === String(request.user._id);
    const isClaimant = String(claim.claimantId._id) === String(request.user._id);
    if (!ownsItem && !isClaimant && request.user.role !== 'admin') return response.status(404).json({ message: 'Claim not found.' });
    if (isClaimant && !ownsItem && request.user.role !== 'admin') claim.claimantId = { _id: claim.claimantId._id, name: claim.claimantId.name };
    return response.json({ claim });
  } catch (error) {
    return next(error);
  }
}

export async function reviewClaim(request, response, next) {
  if (!mongoose.isValidObjectId(request.params.id)) return response.status(404).json({ message: 'Claim not found.' });
  const nextStatus = request.body.status;
  if (!['approved', 'rejected'].includes(nextStatus)) return response.status(400).json({ message: 'Choose approved or rejected.' });

  let claim;
  let item;
  try {
    claim = await Claim.findById(request.params.id);
    if (!claim) return response.status(404).json({ message: 'Claim not found.' });
    item = await Item.findById(claim.itemId);
    if (!item) return response.status(404).json({ message: 'Report not found.' });
    const canReview = String(item.userId) === String(request.user._id) || request.user.role === 'admin';
    if (!canReview) return response.status(403).json({ message: 'Only the report owner or an administrator can review this claim.' });
    if (claim.status !== 'pending') return response.status(409).json({ message: 'This claim has already been reviewed.' });

    if (nextStatus === 'approved') {
      if (['returned', 'closed'].includes(item.status)) return response.status(409).json({ message: 'This report cannot be returned again.' });
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          const freshClaim = await Claim.findOne({ _id: claim._id, status: 'pending' }).session(session);
          const freshItem = await Item.findById(item._id).session(session);
          if (!freshClaim || !freshItem || ['returned', 'closed'].includes(freshItem.status)) {
            const conflict = new Error('Claim or report changed while this review was in progress.');
            conflict.status = 409;
            throw conflict;
          }

          freshClaim.status = 'approved';
          freshClaim.reviewedBy = request.user._id;
          await freshClaim.save({ session });
          freshItem.status = 'returned';
          freshItem.returnedAt = new Date();
          await freshItem.save({ session });

          const otherClaims = await Claim.find({ itemId: freshItem._id, _id: { $ne: freshClaim._id }, status: 'pending' }).select('claimantId').session(session);
          await Claim.updateMany({ itemId: freshItem._id, _id: { $ne: freshClaim._id }, status: 'pending' }, { $set: { status: 'rejected', reviewedBy: request.user._id } }, { session });
          const notices = [
            { userId: freshClaim.claimantId, type: 'claim', relatedItemId: freshItem._id, message: 'Your ownership claim was approved. The report is marked returned.' },
            ...otherClaims.map((otherClaim) => ({ userId: otherClaim.claimantId, type: 'claim', relatedItemId: freshItem._id, message: 'Another claim was approved for this report.' })),
          ];
          await Notification.insertMany(notices, { session });
          await Match.updateMany({ $or: [{ lostItemId: freshItem._id }, { foundItemId: freshItem._id }], status: { $in: ['suggested', 'confirmed'] } }, { $set: { status: 'resolved' } }, { session });
        });
      } finally {
        await session.endSession();
      }
    } else {
      claim.status = 'rejected';
      claim.reviewedBy = request.user._id;
      await claim.save();
      await Notification.create({ userId: claim.claimantId, type: 'claim', relatedItemId: item._id, message: 'Your ownership claim was not approved.' });
      const remaining = await Claim.countDocuments({ itemId: item._id, status: 'pending' });
      if (!remaining && item.status === 'claimed') {
        item.status = 'open';
        await item.save();
      }
    }

    const result = await Claim.findById(claim._id).populate('itemId', claimItemFields).populate('claimantId', 'name email').lean();
    return response.json({ claim: result });
  } catch (error) {
    if (error.status) return response.status(error.status).json({ message: error.message });
    if (nextStatus === 'approved' && isTransactionUnsupported(error)) {
      try {
        const reviewed = await approveWithoutTransactions(claim, item, request.user._id);
        return response.json({ claim: reviewed, consistency: 'compensating-writes' });
      } catch (fallbackError) {
        if (fallbackError.status) return response.status(fallbackError.status).json({ message: fallbackError.message });
        return next(fallbackError);
      }
    }
    return next(error);
  }
}

