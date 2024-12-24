const express = require('express');
const router = express.Router();
const { User, Group, Post } = require('./db');

// Posts routes
router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().populate('author');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/posts', async (req, res) => {
  try {
    const post = new Post(req.body);
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/posts/:id', async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Groups routes
router.get('/groups', async (req, res) => {
  try {
    const groups = await Group.find();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/groups/join', async (req, res) => {
  try {
    const { userId, groupId } = req.body;
    await Group.findByIdAndUpdate(groupId, { $push: { members: userId } });
    await User.findByIdAndUpdate(userId, { $push: { joinedGroups: groupId } });
    res.json({ message: 'Joined group successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/groups/leave', async (req, res) => {
  try {
    const { userId, groupId } = req.body;
    await Group.findByIdAndUpdate(groupId, { $pull: { members: userId } });
    await User.findByIdAndUpdate(userId, { $pull: { joinedGroups: groupId } });
    res.json({ message: 'Left group successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 