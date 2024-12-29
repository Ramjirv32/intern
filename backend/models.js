const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: String,
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  avatar: String,
  joinedGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
  followedGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }]
});

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { _id: this._id.toString(), email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const groupSchema = new mongoose.Schema({
  name: String,
  image: String,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  followers: { type: Number, default: 0 },
  followedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const postSchema = new mongoose.Schema({
  type: String,
  title: String,
  content: String,
  image: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const articleSchema = new mongoose.Schema({
  title: String,
  content: String,
  category: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const manualRegisterSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

manualRegisterSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

manualRegisterSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

const ManualRegister = mongoose.model('ManualRegister', manualRegisterSchema);

const User = mongoose.model('User', userSchema);
const Group = mongoose.model('Group', groupSchema);
const Post = mongoose.model('Post', postSchema);
const Article = mongoose.model('Article', articleSchema);

module.exports = { User, Group, Post, Article, ManualRegister }; 