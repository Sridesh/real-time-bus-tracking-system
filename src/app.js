require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const swaggerUI = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger.config');
const routes = require('./routes');
const redisService = require('./services/redis.service');
const { commonRateLimiter } = require('./middleware/rateLimiter.middleware');
const errorHandler = require('./middleware/errorHandler.middleware');

const app = express();

app.set('trust proxy', 1);

// Redis
const connectRedis = async () => {
  await redisService.connect();
};
connectRedis();

// Middleware
app.use(express.json());

// CORS - More permissive
const corsOptions = {
  origin: '*',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use((req, res, next) => {
  if (req.path.startsWith('/docs')) {
    // avoiding applying helmet to swagger routes
    return next();
  }

  // for other routes
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'validator.swagger.io'],
      },
    },
  })(req, res, next);
});

// Rate limiter
app.use(commonRateLimiter);

// Root
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bus Tracking API Server',
    version: '1.0.0',
    documentation: '/docs',
    apiBase: '/api',
    health: '/api/v1/health',
  });
});

const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    url: '/docs.json',
    persistAuthorization: true,
  },
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Bus Tracking API Documentation',
};

app.use('/docs', swaggerUI.serve);
app.get('/docs', swaggerUI.setup(swaggerSpecs, swaggerOptions));

// Serve swagger JSON
app.get('/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpecs);
});

// API routes
app.use('/api', routes);

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;
