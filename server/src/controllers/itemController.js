import mongoose from 'mongoose';
import Item, { ITEM_CATEGORIES, ITEM_STATUSES, ITEM_TYPES } from '../models/Item.js';
import Claim from '../models/Claim.js';
import Notification from '../models/Notification.js';
import { findMatchesFor, resolveMatchesFor } from '../services/matching.js';
import { removeImage, saveImage } from '../services/uploadStorage.js';

const publicFields = 'itemName type category description location dateOfIncident imageUrl status createdAt updatedAt returnedAt';

function validDate(value) {
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed <= new Date();
}

function safeRegex(value) {
  return value.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}

function parsePagination(query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(query.limit, 10) || 12));
  return { page, limit, skip: (page - 1) * limit };
}

export async function listItems(request, response, next) {
  try {
    const filter = {};
    if (request.query.type) {
      if (!ITEM_TYPES.includes(request.query.type)) return response.status(400).json({ message: 'Invalid item type.' });
      filter.type = request.query.type;
    }
    if (request.query.category) {
      if (!ITEM_CATEGORIES.includes(request.query.category)) return response.status(400).json({ message: 'Invalid category.' });
      filter.category = request.query.category;
    }
    if (request.query.status && request.query.status !== 'all') {
      const statuses = String(request.query.status).split(',').filter((status) => ITEM_STATUSES.includes(status));
      if (!statuses.length) return response.status(400).json({ message: 'Invalid report status.' });
      filter.status = { $in: statuses };
    } else {
      filter.status = 'open';
    }
    if (request.query.location) filter.location = { $regex: safeRegex(String(request.query.location).slice(0, 80)), $options: 'i' };
    if (request.query.dateFrom || request.query.dateTo) {
      filter.dateOfIncident = {};
      if (request.query.dateFrom) {
        const from = new Date(request.query.dateFrom);
        if (Number.isNaN(from.getTime())) return response.status(400).json({ message: 'Invalid start date.' });
        filter.dateOfIncident.$gte = from;
      }
      if (request.query.dateTo) {
        const to = new Date(request.query.dateTo);
        if (Number.isNaN(to.getTime())) return response.status(400).json({ message: 'Invalid end date.' });
        to.setHours(23, 59, 59, 999);
        filter.dateOfIncident.$lte = to;
      }
    }

    const keyword = typeof request.query.q === 'string' ? request.query.q.trim().slice(0, 100) : '';
    if (keyword) filter.$text = { $search: keyword };
    const { page, limit, skip } = parsePagination(request.query);
    const sort = request.query.sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
    const [items, total] = await Promise.all([
      Item.find(filter).select(publicFields).sort(sort).skip(skip).limit(limit).lean(),
      Item.countDocuments(filter),
    ]);
    return response.json({ items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    return next(error);
  }
}

export async function listMyItems(request, response, next) {
  try {
    const filter = { userId: request.user._id };
    if (request.query.type && ITEM_TYPES.includes(request.query.type)) filter.type = request.query.type;
    const items = await Item.find(filter).select(publicFields).sort({ createdAt: -1 }).limit(100).lean();
    return response.json({ items });
  } catch (error) {
    return next(error);
  }
}

export async function getItem(request, response, next) {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) return response.status(404).json({ message: 'Report not found.' });
    const item = await Item.findById(request.params.id).select(publicFields + ' userId').lean();
    if (!item) return response.status(404).json({ message: 'Report not found.' });
    const isOwner = Boolean(request.user && String(item.userId) === String(request.user._id));
    delete item.userId;
    return response.json({ item, isOwner });
  } catch (error) {
    return next(error);
  }
}

export async function createItem(request, response, next) {
  let imageUrl = null;
  let itemSaved = false;
  try {
    const { itemName, type, category, description, location, dateOfIncident } = request.body;
    if (!ITEM_TYPES.includes(type)) return response.status(400).json({ message: 'Choose lost or found.' });
    if (!ITEM_CATEGORIES.includes(category)) return response.status(400).json({ message: 'Choose a valid category.' });
    if (!validDate(dateOfIncident)) return response.status(400).json({ message: 'Enter a valid incident date that is not in the future.' });
    imageUrl = await saveImage(request.file);
    const item = await Item.create({
      userId: request.user._id,
      itemName,
      type,
      category,
      description,
      location,
      dateOfIncident,
      imageUrl,
      status: 'open',
    });
    itemSaved = true;
    await findMatchesFor(item).catch((error) => console.error('Match generation failed:', error.message));
    return response.status(201).json({ item: await Item.findById(item._id).select(publicFields).lean() });
  } catch (error) {
    if (imageUrl && !itemSaved) await removeImage(imageUrl);
    if (error?.name === 'ValidationError') return response.status(400).json({ message: 'Check the report details and try again.' });
    return next(error);
  }
}
export async function updateItem(request, response, next) {
  let newImageUrl = null;
  let previousImageUrl = null;
  let itemSaved = false;
  try {
    if (!mongoose.isValidObjectId(request.params.id)) return response.status(404).json({ message: 'Report not found.' });
    const item = await Item.findById(request.params.id);
    if (!item) return response.status(404).json({ message: 'Report not found.' });
    const isAdmin = request.user.role === 'admin';
    const isOwner = String(item.userId) === String(request.user._id);
    if (!isOwner && !isAdmin) return response.status(404).json({ message: 'Report not found.' });
    if (['returned', 'closed'].includes(item.status)) return response.status(409).json({ message: 'This report is already closed.' });

    if (request.body.status !== undefined) {
      if (!isAdmin && request.body.status !== 'closed') return response.status(403).json({ message: 'Only administrators can change this report status.' });
      if (!ITEM_STATUSES.includes(request.body.status)) return response.status(400).json({ message: 'Invalid report status.' });
    }
    for (const field of ['itemName', 'category', 'description', 'location', 'dateOfIncident']) {
      if (request.body[field] !== undefined) item[field] = request.body[field];
    }
    if (request.body.category !== undefined && !ITEM_CATEGORIES.includes(request.body.category)) return response.status(400).json({ message: 'Choose a valid category.' });
    if (request.body.dateOfIncident !== undefined && !validDate(request.body.dateOfIncident)) return response.status(400).json({ message: 'Enter a valid incident date that is not in the future.' });
    if (request.body.status !== undefined) {
      item.status = request.body.status;
      if (item.status === 'returned') item.returnedAt = new Date();
    }
    if (request.file) {
      newImageUrl = await saveImage(request.file);
      previousImageUrl = item.imageUrl;
      item.imageUrl = newImageUrl;
    }

    await item.save();
    itemSaved = true;
    if (previousImageUrl) await removeImage(previousImageUrl);
    if (['closed', 'returned'].includes(item.status)) await resolveMatchesFor(item._id);
    else await findMatchesFor(item).catch((error) => console.error('Match generation failed:', error.message));

    if (isAdmin && request.body.status) {
      await Notification.create({ userId: item.userId, type: 'report', relatedItemId: item._id, message: 'An administrator updated the status of your report.' });
    }
    return response.json({ item: await Item.findById(item._id).select(publicFields).lean() });
  } catch (error) {
    if (newImageUrl && !itemSaved) await removeImage(newImageUrl);
    if (error?.name === 'ValidationError') return response.status(400).json({ message: 'Check the report details and try again.' });
    return next(error);
  }
}
export async function closeItem(request, response, next) {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) return response.status(404).json({ message: 'Report not found.' });
    const item = await Item.findById(request.params.id);
    if (!item || (String(item.userId) !== String(request.user._id) && request.user.role !== 'admin')) {
      return response.status(404).json({ message: 'Report not found.' });
    }
    if (item.status === 'returned') return response.status(409).json({ message: 'Returned reports cannot be closed.' });
    item.status = 'closed';
    await item.save();
    await resolveMatchesFor(item._id);
    const pendingClaims = await Claim.find({ itemId: item._id, status: 'pending' }).select('claimantId');
    await Claim.updateMany({ itemId: item._id, status: 'pending' }, { $set: { status: 'rejected', reviewedBy: request.user._id } });
    if (pendingClaims.length) await Notification.insertMany(pendingClaims.map((claim) => ({
      userId: claim.claimantId,
      type: 'claim',
      relatedItemId: item._id,
      message: 'A claim could not be approved because the report was closed.',
    })));
    return response.json({ item: await Item.findById(item._id).select(publicFields).lean() });
  } catch (error) {
    return next(error);
  }
}
