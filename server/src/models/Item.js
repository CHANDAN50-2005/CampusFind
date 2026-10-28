import mongoose from 'mongoose';

export const ITEM_CATEGORIES = ['electronics', 'accessories', 'books', 'clothing', 'id-cards', 'keys', 'bags', 'other'];
export const ITEM_TYPES = ['lost', 'found'];
export const ITEM_STATUSES = ['open', 'matched', 'claimed', 'returned', 'closed'];

const itemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  itemName: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  type: { type: String, required: true, enum: ITEM_TYPES, index: true },
  category: { type: String, required: true, enum: ITEM_CATEGORIES, index: true },
  description: { type: String, required: true, trim: true, minlength: 8, maxlength: 2000 },
  location: { type: String, required: true, trim: true, minlength: 2, maxlength: 160 },
  dateOfIncident: { type: Date, required: true, index: true },
  imageUrl: { type: String, default: null, maxlength: 500 },
  status: { type: String, required: true, enum: ITEM_STATUSES, default: 'open', index: true },
  returnedAt: { type: Date, default: null },
}, { timestamps: true });

itemSchema.index({ type: 1, status: 1, createdAt: -1 });
itemSchema.index({ category: 1, createdAt: -1 });
itemSchema.index({ userId: 1, createdAt: -1 });
itemSchema.index({ itemName: 'text', description: 'text' }, { weights: { itemName: 5, description: 2 }, name: 'item_text_search' });

const Item = mongoose.model('Item', itemSchema);
export default Item;
