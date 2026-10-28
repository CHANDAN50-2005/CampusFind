import mongoose from 'mongoose';
import Item from '../models/Item.js';
import Match from '../models/Match.js';
import Notification from '../models/Notification.js';

function normalize(text) {
  return String(text || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

const stopWords = new Set(['a', 'an', 'and', 'at', 'for', 'from', 'in', 'is', 'it', 'of', 'on', 'or', 'the', 'to', 'with']);

function tokenSet(value) {
  return new Set(normalize(value).split(' ').filter((token) => token.length > 1 && !stopWords.has(token)));
}

function jaccard(left, right) {
  const a = tokenSet(left);
  const b = tokenSet(right);
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const token of a) if (b.has(token)) intersection += 1;
  return intersection / (a.size + b.size - intersection);
}

function similarity(lost, found) {
  const lostName = normalize(lost.itemName);
  const foundName = normalize(found.itemName);
  const name = Math.max(jaccard(lost.itemName, found.itemName), lostName === foundName ? 1 : 0);
  const description = jaccard(lost.description, found.description);
  const category = lost.category === found.category ? 1 : 0;
  const lostLocation = normalize(lost.location);
  const foundLocation = normalize(found.location);
  const location = Math.max(jaccard(lost.location, found.location), lostLocation.includes(foundLocation) || foundLocation.includes(lostLocation) ? 0.8 : 0);
  const days = Math.abs(new Date(lost.dateOfIncident).getTime() - new Date(found.dateOfIncident).getTime()) / 86400000;
  const date = Math.max(0, 1 - days / 30);
  const score = Math.round((name * 0.25 + description * 0.35 + category * 0.15 + location * 0.15 + date * 0.10) * 100);
  const reasons = [];
  if (name >= 0.3) reasons.push('Similar item names');
  if (description >= 0.2) reasons.push('Description keywords overlap');
  if (category) reasons.push('Same category');
  if (location >= 0.3) reasons.push('Nearby or similar location');
  if (date >= 0.65) reasons.push('Dates are close');
  return { score, reasons };
}

async function createMatch(lost, found) {
  const { score, reasons } = similarity(lost, found);
  const previous = await Match.findOne({ lostItemId: lost._id, foundItemId: found._id });
  if (previous?.status === 'dismissed' || previous?.status === 'resolved') return;
  if (score < 20) {
    if (previous?.status === 'suggested') await Match.updateOne({ _id: previous._id }, { $set: { status: 'resolved' } });
    return;
  }
  if (previous) {
    await Match.updateOne({ _id: previous._id }, { $set: { score, matchingReasons: reasons } });
    return;
  }

  try {
    await Match.create({ lostItemId: lost._id, foundItemId: found._id, score, matchingReasons: reasons });
    const recipients = new Set([String(lost.userId), String(found.userId)]);
    await Notification.insertMany([...recipients].map((userId) => ({
      userId,
      type: 'match',
      message: 'A new possible match was found for one of your reports.',
      relatedItemId: userId === String(lost.userId) ? lost._id : found._id,
    })));
  } catch (error) {
    if (error?.code !== 11000) throw error;
  }
}

export async function findMatchesFor(item) {
  if (item.status !== 'open') return [];
  const oppositeType = item.type === 'lost' ? 'found' : 'lost';
  const opposite = await Item.find({ type: oppositeType, status: 'open' }).sort({ createdAt: -1 }).limit(500);
  for (const candidate of opposite) {
    const lost = item.type === 'lost' ? item : candidate;
    const found = item.type === 'found' ? item : candidate;
    await createMatch(lost, found);
  }
}

export async function resolveMatchesFor(itemId) {
  await Match.updateMany({
    $or: [{ lostItemId: itemId }, { foundItemId: itemId }],
    status: { $in: ['suggested', 'confirmed'] },
  }, { $set: { status: 'resolved' } });
}
