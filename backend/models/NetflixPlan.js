// models/NetflixPlan.js
import mongoose from 'mongoose';

const netflixPlanSchema = new mongoose.Schema({
  planType: {
    type: String,
    default: 'Premium',
    required: true,
    immutable: true, // cannot change plan type
  },

  purchaseOption: {
    type: String,
    enum: ['individual', 'shared'],
    required: true,
    unique: true, // only one individual + one shared
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

  duration: {
    type: String,
    default: 'monthly',
    immutable: true, // fixed monthly
  },

  features: {
    type: [String],
    default: [
      'Ultra HD (4K) streaming',
      '4 simultaneous streams',
      'Download on 6 devices',
      'Ad-free viewing',
      'Spatial audio',
      'Full access to Netflix library',
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

netflixPlanSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('NetflixPlan', netflixPlanSchema);