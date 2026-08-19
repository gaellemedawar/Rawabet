import mongoose from 'mongoose';

const swipeSchema = new mongoose.Schema(
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
    // Who performed this swipe: the investor browsing businesses,
    // or the business reviewing an investor who already liked them.
    swipedBy: { type: String, enum: ['investor', 'business'], required: true },
    direction: { type: String, enum: ['like', 'pass'], required: true },
    // AI compatibility score shown to the investor at swipe time, if any.
    aiScore: { type: Number, min: 0, max: 100 },
    aiExplanation: { type: String },
  },
  { timestamps: true }
);

swipeSchema.index(
  { investorProfile: 1, businessProfile: 1, swipedBy: 1 },
  { unique: true }
);

export default mongoose.model('Swipe', swipeSchema);
