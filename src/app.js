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

//trust nginx proxy
app.set('trust proxy', 1);

// redis
const connectRedis = async () => {
  await redisService.connect();
};
connectRedis();

// middleware
app.use(express.json());
app.use(commonRateLimiter); // rate limiter
// security headers for HTTP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // For swagger
        scriptSrc: ["'self'", "'unsafe-inline'"], // For swagger
        imgSrc: ["'self'", 'data:', 'validator.swagger.io'],
      },
    },
  })
);
// CORS
const corsOptions = {
  origin: ['*'],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// swagger docs
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpecs));

// API routes
app.use('/api', routes);

// health endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handler (should be last)
app.use(errorHandler);

module.exports = app;
