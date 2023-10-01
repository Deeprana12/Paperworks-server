const mongoose = require('mongoose');

const commentContentSchema = new mongoose.Schema({
    type: {
      type: String,
      enum: ['text', 'mention'],
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }
)

const commentSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true
  },
  content: [ commentContentSchema ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  replies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ]
});

const pdfSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  fileData: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sharedWith: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  comments: [commentSchema]
}); 

const Pdf = mongoose.model('Pdf', pdfSchema);
const Comment = mongoose.model('Comment', commentSchema);
const CommentContent = mongoose.model('Comment_Content', commentContentSchema);

module.exports = { Pdf, Comment, CommentContent };
