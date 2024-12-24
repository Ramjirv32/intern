const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');

async function setup() {
  try {
    // Ensure directories exist
    await fs.ensureDir(path.join(__dirname, 'uploads'));
    await fs.ensureDir(path.join(__dirname, 'uploads/images'));

    // Copy images
    await fs.copy(
      path.join(__dirname, '..', 'src', 'images'),
      path.join(__dirname, 'uploads', 'images'),
      { overwrite: true }
    );

    // Run seeds
    console.log('Running seeds...');
    await Promise.all([
      exec('node seedData.js'),
      exec('node seedArticles.js')
    ]);

    console.log('Setup completed successfully');
  } catch (error) {
    console.error('Setup error:', error);
  }
}

setup(); 