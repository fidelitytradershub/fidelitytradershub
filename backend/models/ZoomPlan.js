// models/ZoomPlan.js
import mongoose from 'mongoose';

const zoomPlanSchema = new mongoose.Schema({
  planName: {
    type: String,
    default: 'Zoom Pro',
    required: true,
    immutable: true, // fixed name
  },

  duration: {
    type: String,
    default: 'monthly',
    immutable: true, // fixed monthly
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
      'Up to 100 participants',
      '30-hour group meeting duration',
      'Recording & cloud storage (5 GB)',
      'HD video & audio',
      'Screen sharing',
      'Whiteboard',
      'Breakout rooms',
      'Custom branding',
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

zoomPlanSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('ZoomPlan', zoomPlanSchema);