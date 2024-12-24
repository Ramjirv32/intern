const mongoose = require('mongoose');
const models = require('./models');
const { User, Post, Group } = models;

const initialGroups = [
  {
    name: 'ATG World',
    image: '/static/group1.png',
    description: 'Welcome to ATG World',
    followers: 0,
    members: [],
    posts: []
  }
];

async function seedGroups() {
  try {
    // Clear existing groups
    await Group.deleteMany({});
    console.log('Cleared existing groups');

    // Insert new groups
    const groups = await Group.insertMany(initialGroups);
    console.log('Groups seeded successfully');

    return groups;
  } catch (error) {
    console.error('Error seeding groups:', error);
    throw error;
  }
}

async function seedData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/coc');
    console.log('Connected to MongoDB');

    const groups = await seedGroups();
    const defaultGroup = groups[0];

    // Update initial posts with group reference
    const initialPosts = [
      {
        type: 'Article',
        title: 'What if famous brands had regular fonts? Meet RegulaBrands!',
        content: "I've worked in UX for the better part of a decade...",
        image: '/static/m.png',
        group: defaultGroup._id,
        views: 1400
      },
      // ... other posts
    ];

    await Post.deleteMany({});
    const posts = await Post.insertMany(initialPosts);

    // Update group with posts
    await Group.findByIdAndUpdate(defaultGroup._id, {
      $push: { posts: { $each: posts.map(p => p._id) } }
    });

    console.log('Data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData(); 