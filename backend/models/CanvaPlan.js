// models/CanvaPlan.js
import mongoose from 'mongoose';

const canvaPlanSchema = new mongoose.Schema({
  planName: {
    type: String,
    default: 'Canva Pro', // fixed – no need for multiple plans
    required: true,
  },

  duration: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: true,
    unique: true, // only one monthly + one yearly
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
      'Unlimited templates & elements',
      'Background remover',
      'Brand kit',
      'Resize designs instantly',
      'Premium content access',
      'Team collaboration (up to 5 people)',
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

canvaPlanSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('CanvaPlan', canvaPlanSchema);