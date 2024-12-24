const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/coc', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define Schemas
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  avatar: String,
  joinedGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }]
});

const groupSchema = new mongoose.Schema({
  name: String,
  image: String,
  followers: Number,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const postSchema = new mongoose.Schema({
  type: String, // 'Article', 'Education', 'Meetup', 'Job'
  title: String,
  content: String,
  image: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  location: String,
  date: Date // for events/meetups
});

// Create models
const User = mongoose.model('User', userSchema);
const Group = mongoose.model('Group', groupSchema);
const Post = mongoose.model('Post', postSchema);

module.exports = { User, Group, Post }; 