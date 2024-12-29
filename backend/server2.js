require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ramji:vikas@cluster0.ln4g5.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

// Update CORS configuration
app.use(cors({
  origin: 'http://localhost:5001',
  credentials: true
}));
app.use(express.json());


mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB Atlas connected'))
  .catch(err => console.error('MongoDB connection error:', err));
  const oneSchema = new mongoose.Schema({
    id: { type: String, required: true },
    value: { type: String, required: true }
  });
  
  // Create the model for the 'one' collection
  const One = mongoose.model('One', oneSchema, 'one');
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    text: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});


const commentSchema = new mongoose.Schema({
  postId: { type: String, required: true },  // Post ID
  text: { type: String, required: true },    // Comment text
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Specify the collection name as 'com'
const Comment = mongoose.model('Comment', commentSchema, 'com');




const Post = mongoose.model('Post', postSchema);

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

app.post('/posts/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;  

    const post = await Post.findById(id).populate('comments.text', 'name');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Return the comments for the post
    res.json(post.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




app.post('/posts/comments', async (req, res) => {
  console.log("received");

  try {
    const { postId, text } = req.body;

    if (!postId || !text) {
      return res.status(400).json({ message: "Missing postId or text" });
    }

    const newComment = new Comment({
      postId: postId,
      text: text,
    });


    const result = await newComment.save();

    console.log('Inserted Comment:', result);

    res.status(201).json(result);
  } catch (error) {
    console.error('Error inserting comment:', error);
    res.status(400).json({ message: error.message });
  }
});




app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

