const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const { User, Group, Post, Article } = require('./models');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/coc')
  .then(() => {
    console.log('Connected to MongoDB successfully');
    // Test query to check if data exists
    return Post.countDocuments();
  })
  .then(count => {
    console.log(`Found ${count} posts in database`);
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// API Routes
// Posts Routes
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate({
        path: 'author',
        select: 'name email avatar'
      })
      .sort({ createdAt: -1 });
    
    console.log('Fetched posts count:', posts.length);
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const post = new Post(req.body);
    await post.save();
    
    // Populate the author details before sending response
    const populatedPost = await Post.findById(post._id).populate({
      path: 'author',
      select: 'name email avatar'
    });
    
    console.log('Created post:', populatedPost);
    res.json(populatedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    ).populate({
      path: 'author',
      select: 'name email avatar'
    });
    
    console.log('Updated post:', post);
    res.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  try {
    console.log('Attempting to delete post:', req.params.id);

    // First find the post to get its details
    const post = await Post.findById(req.params.id);
    if (!post) {
      console.log('Post not found for deletion');
      return res.status(404).json({ message: 'Post not found' });
    }

    // Delete the post from database
    const result = await Post.deleteOne({ _id: req.params.id });
    
    if (result.deletedCount === 0) {
      console.log('Post not deleted from database');
      return res.status(404).json({ message: 'Post not found or already deleted' });
    }

    // Delete associated image if it exists
    if (post.image) {
      try {
        const imagePath = path.join(__dirname, post.image.replace(/^\//, ''));
        console.log('Checking image at:', imagePath);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log('Successfully deleted image:', imagePath);
        }
      } catch (error) {
        console.error('Error deleting image file:', error);
        // Continue even if image deletion fails
      }
    }

    console.log('Post successfully deleted:', req.params.id);
    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
      postId: req.params.id
    });

  } catch (error) {
    console.error('Error in delete post endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message
    });
  }
});

// Groups Routes
app.get('/api/groups', async (req, res) => {
  try {
    const groups = await Group.find();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/groups/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members')
      .populate({
        path: 'posts',
        populate: {
          path: 'author',
          select: 'name email avatar'
        }
      });
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/groups/join', async (req, res) => {
  try {
    const { userId, groupId } = req.body;
    const group = await Group.findByIdAndUpdate(
      groupId,
      { 
        $addToSet: { members: userId },
        $inc: { followers: 1 }
      },
      { new: true }
    ).populate('members');
    
    await User.findByIdAndUpdate(userId, {
      $addToSet: { joinedGroups: groupId }
    });

    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/groups/leave', async (req, res) => {
  try {
    const { userId, groupId } = req.body;
    
    // Find the group first
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Update group
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { 
        $pull: { members: userId },
        $inc: { followers: -1 }
      },
      { new: true }
    ).populate('members');

    // Update user
    await User.findByIdAndUpdate(
      userId,
      { $pull: { joinedGroups: groupId } }
    );

    res.json(updatedGroup);
  } catch (error) {
    console.error('Error in leave group:', error);
    res.status(500).json({ 
      error: error.message,
      message: 'Failed to leave group' 
    });
  }
});

// Create post in group
app.post('/api/groups/:groupId/posts', async (req, res) => {
  try {
    // Validate groupId
    if (!mongoose.Types.ObjectId.isValid(req.params.groupId)) {
      return res.status(400).json({ message: 'Invalid group ID' });
    }

    // Check if group exists
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Create and save the post
    const post = new Post({
      ...req.body,
      group: req.params.groupId
    });
    await post.save();

    // Add post to group
    await Group.findByIdAndUpdate(req.params.groupId, {
      $push: { posts: post._id }
    });

    // Return populated post
    const populatedPost = await Post.findById(post._id)
      .populate('author')
      .populate('group');

    console.log('Created group post:', populatedPost);
    res.json(populatedPost);
  } catch (error) {
    console.error('Error creating group post:', error);
    res.status(500).json({ 
      error: error.message,
      message: 'Failed to create post in group'
    });
  }
});

// User Routes
app.post('/api/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('joinedGroups');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add this route to find user by email
app.get('/api/users/email/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads', 'images');
    // Ensure directory exists
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, 'uploads/images')));
app.use('/static', express.static(path.join(__dirname, '..', 'src', 'images')));

// Add file upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Articles Routes
app.get('/api/articles', async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/articles/:category', async (req, res) => {
  try {
    const articles = await Article.find({ category: req.params.category });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/articles', async (req, res) => {
  try {
    const article = new Article(req.body);
    await article.save();
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add this near the top of your routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', port: PORT });
});

// Add follow group endpoint
app.post('/api/groups/follow', async (req, res) => {
  try {
    const { userId, groupId } = req.body;
    
    const group = await Group.findByIdAndUpdate(
      groupId,
      { $inc: { followers: 1 } },
      { new: true }
    );

    // Add to user's followed groups
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { followedGroups: groupId } }
    );

    res.json(group);
  } catch (error) {
    console.error('Error following group:', error);
    res.status(500).json({ 
      error: error.message,
      message: 'Failed to follow group' 
    });
  }
});

// Add unfollow group endpoint
app.post('/api/groups/unfollow', async (req, res) => {
  try {
    const { userId, groupId } = req.body;
    
    const group = await Group.findByIdAndUpdate(
      groupId,
      { $inc: { followers: -1 } },
      { new: true }
    );

    // Remove from user's followed groups
    await User.findByIdAndUpdate(
      userId,
      { $pull: { followedGroups: groupId } }
    );

    res.json(group);
  } catch (error) {
    console.error('Error unfollowing group:', error);
    res.status(500).json({ 
      error: error.message,
      message: 'Failed to unfollow group' 
    });
  }
});

// Update the server start code
const startServer = async () => {
  try {
    // First connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/coc');
    console.log('Connected to MongoDB successfully');

    // Then start the server
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy. Trying ${PORT + 1}`);
        const newPort = PORT + 1;
        app.listen(newPort, () => {
          console.log(`Server is running on port ${newPort}`);
        });
      } else {
        console.error('Server error:', err);
      }
    });
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
};

startServer();