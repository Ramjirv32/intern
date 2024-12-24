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

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/coc')
  .then(() => {
    console.log('Connected to MongoDB successfully');
    return Post.countDocuments();
  })
  .then(count => {
    console.log(`Found ${count} posts in database`);
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

[... rest of the file without comments ...]