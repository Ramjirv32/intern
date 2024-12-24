const mongoose = require('mongoose');

// Define Schemas
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  avatar: String,
  joinedGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
  followedGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }]
});

const groupSchema = new mongoose.Schema({
  name: String,
  image: String,
  description: String,
  followers: Number,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  type: String,
  title: String,
  content: String,
  image: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  location: String,
  date: Date
});

const articleSchema = new mongoose.Schema({
  type: String,
  title: String,
  content: String,
  image: String,
  author: {
    name: String,
    avatar: String,
    designation: String
  },
  views: Number,
  category: String,
  readTime: String,
  createdAt: { type: Date, default: Date.now }
});

// Create and export models
module.exports = {
  User: mongoose.model('User', userSchema),
  Group: mongoose.model('Group', groupSchema),
  Post: mongoose.model('Post', postSchema),
  Article: mongoose.model('Article', articleSchema)
}; 