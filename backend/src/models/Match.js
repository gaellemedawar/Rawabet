import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    investorProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InvestorProfile',
      required: true,
    },
    businessProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusinessProfile',
      required: true,
    },
    aiScore: { type: Number, min: 0, max: 100 },
    aiExplanation: { type: String },
  },
  { timestamps: true }
);

matchSchema.index({ investorProfile: 1, businessProfile: 1 }, { unique: true });

export default mongoose.model('Match', matchSchema);
