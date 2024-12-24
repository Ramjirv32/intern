const mongoose = require('mongoose');
const { Article } = require('./models');

const initialArticles = [
  {
    type: 'Article',
    title: 'What if famous brands had regular fonts? Meet RegulaBrands!',
    content: "I've worked in UX for the better part of a decade. From now on, I plan to rei...",
    image: '/static/m.png',
    author: {
      name: 'Sarthak Kamra',
      avatar: '/static/karma.png',
      designation: 'UX Designer'
    },
    views: 1400,
    category: 'Design',
    readTime: '5 min read'
  },
  {
    type: 'Education',
    title: 'Tax Benefits for Investment under National Pension Scheme',
    content: "I've worked in UX for the better part of a decade. From now on, I plan to rei...",
    image: '/static/door.png',
    author: {
      name: 'Sarah West',
      avatar: '/static/sara.png',
      designation: 'Tax Specialist'
    },
    views: 1400,
    category: 'Finance',
    readTime: '7 min read'
  },
  {
    type: 'Meetup',
    title: 'Finance & Investment Elite Social Mixer @Lujiazui',
    content: "I've worked in UX for the better part of a decade. From now on, I plan to rei...",
    image: '/static/car.png',
    author: {
      name: 'Ronal Jones',
      avatar: '/static/red.png',
      designation: 'Event Organizer'
    },
    views: 1400,
    category: 'Meetup',
    readTime: '10 min read'
  }
];

async function seedArticles() {
  try {
    await mongoose.connect('mongodb://localhost:27017/coc');
    console.log('Connected to MongoDB');

    // Clear existing articles
    await Article.deleteMany({});
    console.log('Cleared existing articles');

    // Insert new articles
    await Article.insertMany(initialArticles);
    console.log('Articles seeded successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding articles:', error);
    process.exit(1);
  }
}

seedArticles(); 