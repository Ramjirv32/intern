const fs = require('fs-extra');
const path = require('path');

async function copyImages() {
  try {
    // Ensure uploads/images directory exists
    await fs.ensureDir(path.join(__dirname, 'uploads', 'images'));

    // Copy images from src to uploads
    await fs.copy(
      path.join(__dirname, '..', 'src', 'images'),
      path.join(__dirname, 'uploads', 'images')
    );

    console.log('Images copied successfully');
  } catch (error) {
    console.error('Error copying images:', error);
  }
}

copyImages(); 