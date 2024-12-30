require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ramji:vikas@cluster0.ln4g5.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

// Update CORS configuration to allow requests from React frontend
app.use(cors({
  origin: 'http://localhost:5001',
  credentials: true
}));

app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB Atlas connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define schemas and models

app.post('/api/posts/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (!post.likes.includes(req.body.userId)) {
      post.likes.push(req.body.userId);
      await post.save();
    }
    res.json({ likes: post.likes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST route for unliking a post
app.post('/api/posts/:id/unlike', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    post.likes = post.likes.filter(id => id.toString() !== req.body.userId);
    await post.save();
    res.json({ likes: post.likes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST route for submitting a comment
app.post('/posts/comments', async (req, res) => {
  try {
    const { postId, text, userId } = req.body;

    if (!postId || !text || !userId) {
      return res.status(400).json({ message: "Missing postId, text, or userId" });
    }

    const newComment = new Comment({
      postId: postId,
      text: text,
      author: userId, // Assuming the userId is passed from the frontend
    });

    const result = await newComment.save();

    const post = await Post.findById(postId);
    post.comments.push(result);
    await post.save();

    res.status(201).json(result);
  } catch (error) {
    console.error('Error inserting comment:', error);
    res.status(400).json({ message: error.message });
  }
});

// GET route for fetching comments of a post
app.get('/api/posts/:id/comments', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('comments.author', 'name');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
