import mongoose from 'mongoose';

const capcutPlanSchema = new mongoose.Schema({
  planName: {
    type: String,
    default: 'CapCut Pro',
    required: true,
    immutable: true,
  },

  duration: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: true,
  },

  purchaseType: {
    type: String,
    enum: ['individual', 'shared'],
    required: true,
  },

  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be non-negative'],
  },

  currency: {
    type: String,
    default: 'NGN',
    enum: ['NGN'],
  },

  features: {
    type: [String],
    default: [
      'Unlimited exports without watermark',
      'Premium effects & templates',
      'AI auto-cut & background removal',
      '4K export support',
      'Cloud storage',
      'Advanced editing tools',
      'Team collaboration (shared plan)',
      'Priority support',
    ],
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent duplicate combinations
capcutPlanSchema.index({ duration: 1, purchaseType: 1 }, { unique: true });

capcutPlanSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('CapcutPlan', capcutPlanSchema);