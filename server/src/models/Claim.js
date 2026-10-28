import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true, index: true },
  claimantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  message: { type: String, required: true, trim: true, minlength: 10, maxlength: 1200 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', required: true },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

claimSchema.index({ itemId: 1, claimantId: 1 }, { unique: true });
claimSchema.index({ itemId: 1, status: 1, createdAt: -1 });
claimSchema.index({ claimantId: 1, createdAt: -1 });

const Claim = mongoose.model('Claim', claimSchema);
export default Claim;
