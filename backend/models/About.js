import mongoose from 'mongoose';

const aboutSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    default: null,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('About', aboutSchema);