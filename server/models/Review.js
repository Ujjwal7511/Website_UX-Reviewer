import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  url: {
    type: String,
    required: true
  },
  reviewJSON: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  screenshotBase64: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying of user's recent reviews
reviewSchema.index({ userId: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
