import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  lostItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  foundItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  matchingReasons: { type: [String], default: [] },
  status: { type: String, enum: ['suggested', 'dismissed', 'confirmed', 'resolved'], default: 'suggested', required: true },
}, { timestamps: true });

matchSchema.index({ lostItemId: 1, foundItemId: 1 }, { unique: true });
matchSchema.index({ status: 1, score: -1, updatedAt: -1 });
matchSchema.index({ lostItemId: 1, status: 1 });
matchSchema.index({ foundItemId: 1, status: 1 });

const Match = mongoose.model('Match', matchSchema);
export default Match;
