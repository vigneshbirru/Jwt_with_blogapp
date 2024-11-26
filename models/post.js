const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',  // Reference to the "User" model
  },
  date: {
    type: Date,
    default: Date.now,
  },
  content: String,
  likes: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, // Reference to the "User" model for likes
  ],
});

// Ensure the model is registered
module.exports = mongoose.model('Post', postSchema);
