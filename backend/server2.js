require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT =  4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ramji:vikas@cluster0.ln4g5.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

app.use(cors("*"));
app.use(express.json());

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB Atlas connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const commentSchema = new mongoose.Schema({
  text: String,
  author: String,
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Comment = mongoose.model('Comment', commentSchema);

app.post('/api/comments', async (req, res) => {
  try {
    const { text, author } = req.body;
    const newComment = new Comment({ text, author });
    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/comments', async (req, res) => {
  try {
    const comments = await Comment.find().sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/comments/count', async (req, res) => {
  try {
    const count = await Comment.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/comments/:id/like', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    comment.likes += 1;
    await comment.save();
    res.json({ likes: comment.likes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/comments/:id/dislike', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    if (comment.likes > 0) {
      comment.likes -= 1;
    }
    await comment.save();
    res.json({ likes: comment.likes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
