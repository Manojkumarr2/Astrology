const VedicAstrologyAPI = require('./index');

// Create an instance with optional configuration
const api = new VedicAstrologyAPI({
  port: process.env.PORT || 8000,
  cacheTTL: 3600,
  rateLimitWindow: 15 * 60 * 1000,
  rateLimitMax: 100
});

// Start the server
api.start();