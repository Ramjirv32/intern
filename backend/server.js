require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const { User, Group, Post, Article, ManualRegister } = require('./models');
const fs = require('fs');
const debug = require('debug')('app:server');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Debug logs
console.log('Current directory:', __dirname);
console.log('Environment variables:', {
  MONGODB_URI: process.env.MONGODB_URI,
  PORT: process.env.PORT
});

// Add at the top with other constants
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:5001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Enable pre-flight requests for all routes
app.options('*', cors());

app.use(bodyParser.json());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Static file middleware
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, 'uploads/images')));
app.use('/static', express.static(path.join(__dirname, '..', 'src', 'images')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads', 'images');
fs.mkdirSync(uploadsDir, { recursive: true });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Test routes
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

app.get('/api/test', async (req, res) => {
  try {
    const counts = {
      posts: await Post.countDocuments(),
      users: await User.countDocuments(),
      groups: await Group.countDocuments(),
      articles: await Article.countDocuments()
    };
    res.json({ 
      message: 'Database connection successful',
      counts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

const mongooseOptions = {
  retryWrites: true,
  w: 'majority',
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    console.log('MongoDB connected successfully');
    
    // Create indexes if they don't exist
    try {
      // Drop existing indexes first to avoid duplicate key errors
      await User.collection.dropIndexes();
      await Post.collection.dropIndexes();
      await Group.collection.dropIndexes();
      
      // Create new indexes
      await User.collection.createIndex({ email: 1 }, { unique: true });
      await Post.collection.createIndex({ createdAt: -1 });
      await Group.collection.createIndex({ name: 1 });
      
      console.log('Database indexes created successfully');
    } catch (indexError) {
      console.warn('Warning: Error while managing indexes:', indexError.message);
      // Continue even if index creation fails
    }
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Start server only after MongoDB connects
const startServer = async () => {
  try {
    await connectDB();
    
    const startServerOnPort = (port) => {
      const portNumber = parseInt(port);
      if (isNaN(portNumber) || portNumber < 0 || portNumber >= 65536) {
        console.error('Invalid port number:', port);
        process.exit(1);
      }

      const server = app.listen(portNumber, () => {
        console.log(`Server is running on port ${portNumber}`);
      });

      server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          console.log(`Port ${portNumber} is in use, trying ${portNumber + 1}`);
          startServerOnPort(portNumber + 1);
        } else {
          console.error('Server error:', error);
          process.exit(1);
        }
      });
    };

    startServerOnPort(parseInt(PORT));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// API Routes
// Posts Routes
app.get('/api/posts', async (req, res) => {
  try {
    console.log('GET /api/posts - Fetching posts...');
    const posts = await Post.find()
      .populate({
        path: 'author',
        select: 'name email avatar'
      })
      .sort({ createdAt: -1 });
    
    console.log(`GET /api/posts - Found ${posts.length} posts`);
    res.json(posts);
  } catch (error) {
    console.error('GET /api/posts - Error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch posts',
      error: error.message 
    });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const { groupId, userId } = req.body;

    // If it's a group post, verify membership
    if (groupId) {
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }

      // Check if user is a member of the group
      if (!group.members.includes(userId)) {
        return res.status(403).json({ 
          message: 'You must be a member of this group to create posts' 
        });
      }
    }

    const post = new Post(req.body);
    await post.save();
    
    // Populate the author details before sending response
    const populatedPost = await Post.findById(post._id)
      .populate({
        path: 'author',
        select: 'name email avatar'
      });
    
    // If it's a group post, add it to the group's posts array
    if (groupId) {
      await Group.findByIdAndUpdate(groupId, {
        $push: { posts: populatedPost._id }
      });
    }
    
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
    console.log('GET /api/groups - Fetching groups...');
    const groups = await Group.find()
      .populate('members', 'name email avatar')
      .sort({ createdAt: -1 });
    
    console.log(`GET /api/groups - Found ${groups.length} groups`);
    res.json(groups);
  } catch (error) {
    console.error('GET /api/groups - Error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch groups',
      error: error.message 
    });
  }
});

app.get('/api/groups/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name email avatar')
      .populate({
        path: 'posts',
        populate: {
          path: 'author',
          select: 'name email avatar'
        }
      });
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    res.json(group);
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/groups/join', async (req, res) => {
  try {
    const { userId, groupId } = req.body;
    
    if (!userId || !groupId) {
      return res.status(400).json({ message: 'User ID and Group ID are required' });
    }

    const group = await Group.findByIdAndUpdate(
      groupId,
      { 
        $addToSet: { members: userId },
        $inc: { followers: 1 }
      },
      { new: true }
    ).populate('members', 'name email avatar');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { joinedGroups: groupId } }
    );

    res.json(group);
  } catch (error) {
    console.error('Error joining group:', error);
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
    console.log(`GET /api/users/email/${req.params.email} - Fetching user...`);
    const user = await User.findOne({ email: req.params.email });
    
    if (!user) {
      console.log(`GET /api/users/email/${req.params.email} - User not found`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log(`GET /api/users/email/${req.params.email} - User found`);
    res.json(user);
  } catch (error) {
    console.error(`GET /api/users/email/${req.params.email} - Error:`, error);
    res.status(500).json({ 
      message: 'Failed to fetch user',
      error: error.message 
    });
  }
});

// Configure multer for local storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads', 'images');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Update upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ imageUrl: req.file.path });
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

// Register Route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Protected route example
app.get('/api/user/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

// Apply verifyToken middleware to protected routes
app.use('/api/posts', verifyToken);
app.use('/api/groups', verifyToken);
app.use('/api/articles', verifyToken);

// Error handling middleware - MUST come after routes
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.post('/api/users', async (req, res) => {
  try {
    console.log('POST /api/users - Creating user:', req.body);
    const { name, email, avatar } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      console.log('POST /api/users - User already exists');
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    user = new User({
      name,
      email,
      avatar,
      password: Math.random().toString(36).slice(-8) // Generate random password
    });
    
    await user.save();
    console.log('POST /api/users - User created successfully');
    res.status(201).json(user);
  } catch (error) {
    console.error('POST /api/users - Error:', error);
    res.status(500).json({ 
      message: 'Failed to create user',
      error: error.message 
    });
  }
});

// Add manual registration routes
app.post('/api/auth/manual-register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await ManualRegister.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new user
    const user = new ManualRegister({
      firstName,
      lastName,
      email,
      password
    });

    await user.save();

    res.status(201).json({
      message: 'Registration successful! Please login.',
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Manual registration error:', error);
    res.status(500).json({ 
      message: 'Error during registration', 
      error: error.message 
    });
  }
});

app.post('/api/auth/manual-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await ManualRegister.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key-here',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Manual login error:', error);
    res.status(500).json({ 
      message: 'Error during login', 
      error: error.message 
    });
  }
});

startServer();