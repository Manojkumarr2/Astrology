const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const NodeCache = require('node-cache');
const rateLimit = require('express-rate-limit');

// Import route handlers
const astrologyRoutes = require('./lib/calculator');
const compatibilityRoutes = require('./lib/porutham');
const behaviorRoutes = require('./lib/behavior');
const locationsRoutes = require('./lib/location');

class VedicAstrologyAPI {
  constructor(config = {}) {
    this.app = express();
    this.config = {
      port: config.port || 8000,
      cacheTTL: config.cacheTTL || 3600,
      rateLimitWindow: config.rateLimitWindow || 15 * 60 * 1000,
      rateLimitMax: config.rateLimitMax || 100,
      ...config
    };
    
    this.cache = new NodeCache({ stdTTL: this.config.cacheTTL });
    this.initMiddleware();
    this.initRoutes();
  }
  
  initMiddleware() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));
    
    this.app.use(cors());
    this.app.use(morgan('combined'));
    this.app.use(express.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    
    // Rate limiting
    const limiter = rateLimit({
      windowMs: this.config.rateLimitWindow,
      max: this.config.rateLimitMax,
      message: {
        success: false,
        error: 'Too many requests, please try again later'
      },
      standardHeaders: true,
      legacyHeaders: false
    });
    
    this.app.use(limiter);
    
    // Static files
    this.app.use(express.static(path.join(__dirname, 'public')));
    
    // View engine
    this.app.set('view engine', 'ejs');
    this.app.set('views', path.join(__dirname, 'views'));
  }
  
  initRoutes() {
    // Mount routes with cache instance
    this.app.use('/api/astrology', astrologyRoutes(this.cache));
    this.app.use('/api/compare', compatibilityRoutes(this.cache));
    this.app.use('/api/behavior', behaviorRoutes(this.cache));
    this.app.use('/api/places', locationsRoutes(this.cache));
    
    // Home route
    this.app.get('/', (req, res) => {
      res.render('index', {
        errors: [],
        result: null,
        form: {},
        title: 'CKC Astrology Portal'
      });
    });
    
    // Error handling middleware
    this.app.use((error, req, res, next) => {
      console.error('Unhandled error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    });
  }
  
  start(callback) {
    const server = this.app.listen(this.config.port, () => {
      console.log(`🌟 Vedic Astrology API server running on port ${this.config.port}`);
      console.log(`🔮 Main endpoint: POST http://localhost:${this.config.port}/api/astrology/calculate`);
      
      if (callback && typeof callback === 'function') {
        callback(server);
      }
    });
    
    return server;
  }
  
  getApp() {
    return this.app;
  }
}

module.exports = VedicAstrologyAPI;