#!/usr/bin/env node
// Direct JavaScript server launcher
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Import and start the server
import('./server/index.js')
  .then(() => {
    console.log('JavaScript server started successfully');
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });