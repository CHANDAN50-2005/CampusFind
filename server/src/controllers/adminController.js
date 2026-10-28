import mongoose from 'mongoose';
import Item, { ITEM_STATUSES } from '../models/Item.js';
import Claim from '../models/Claim.js';
import Match from '../models/Match.js';
import Notification from '../models/Notification.js';

export async function listAdminItems(request, response, next) {
  try {
    const filter = {};
    if (request.query.status && ITEM_STATUSES.includes(request.query.status)) filter.status = request.query.status;
    if (request.query.type && ['lost', 'found'].includes(request.query.type)) filter.type = request.query.type;
    const page = Math.max(1, Number.parseInt(request.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(request.query.limit, 10) || 30));
    const [items, total] = await Promise.all([
      Item.find(filter).select('itemName type category description location dateOfIncident imageUrl status createdAt userId')
        .populate('userId', 'name email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Item.countDocuments(filter),
    ]);
    return response.json({ items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    return next(error);
  }
}

export async function listAdminClaims(_request, response, next) {
  try {
    const claims = await Claim.find().sort({ createdAt: -1 }).limit(200)
      .populate('itemId', 'itemName type status userId').populate('claimantId', 'name email').populate('reviewedBy', 'name').lean();
    return response.json({ claims });
  } catch (error) {
    return next(error);
  }
}

export async function moderateItem(request, response, next) {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) return response.status(404).json({ message: 'Report not found.' });
    const status = request.body.status;
    if (!ITEM_STATUSES.includes(status)) return response.status(400).json({ message: 'Invalid report status.' });
    const item = await Item.findById(request.params.id);
    if (!item) return response.status(404).json({ message: 'Report not found.' });
    if (status === 'returned' && !(await Claim.exists({ itemId: item._id, status: 'approved' }))) {
      return response.status(409).json({ message: 'Approve an ownership claim before marking an item returned.' });
    }

    item.status = status;
    item.returnedAt = status === 'returned' ? (item.returnedAt || new Date()) : null;
    await item.save();

    if (['closed', 'returned'].includes(status)) {
      const pending = await Claim.find({ itemId: item._id, status: 'pending' }).select('claimantId').lean();
      await Claim.updateMany({ itemId: item._id, status: 'pending' }, { $set: { status: 'rejected', reviewedBy: request.user._id } });
      if (pending.length) await Notification.insertMany(pending.map((claim) => ({
        userId: claim.claimantId,
        type: 'claim',
        relatedItemId: item._id,
        message: 'A claim could not be approved because the report was closed by an administrator.',
      })));
    }

    await Match.updateMany(
      { $or: [{ lostItemId: item._id }, { foundItemId: item._id }], status: { $in: ['suggested', 'confirmed'] } },
      { $set: { status: ['returned', 'closed'].includes(status) ? 'resolved' : 'suggested' } },
    );
    await Notification.create({
      userId: item.userId,
      type: 'report',
      relatedItemId: item._id,
      message: 'An administrator updated the status of your report.',
    });
    return response.json({ item });
  } catch (error) {
    return next(error);
  }
}
function summarizePlan(explain) {
  const stages = [];
  function visit(node) {
    if (!node || typeof node !== 'object') return;
    if (node.stage && !stages.includes(node.stage)) stages.push(node.stage);
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === 'object') visit(value);
    }
  }
  visit(explain.queryPlanner?.winningPlan);
  return {
    stages,
    returned: explain.executionStats?.nReturned || 0,
    keysExamined: explain.executionStats?.totalKeysExamined || 0,
    documentsExamined: explain.executionStats?.totalDocsExamined || 0,
  };
}

export async function getQueryPlans(request, response, next) {
  try {
    const [browse, ownerReports, textSearch] = await Promise.all([
      Item.find({ type: 'lost', status: 'open' }).sort({ createdAt: -1 }).limit(10).explain('executionStats'),
      Item.find({ userId: request.user._id }).sort({ createdAt: -1 }).limit(10).explain('executionStats'),
      Item.find({ $text: { $search: 'campus item' }, status: 'open' }).limit(10).explain('executionStats'),
    ]);
    return response.json({
      queries: {
        openLostReports: summarizePlan(browse),
        reportsOwnedByAdmin: summarizePlan(ownerReports),
        textSearch: summarizePlan(textSearch),
      },
    });
  } catch (error) {
    return next(error);
  }
}
