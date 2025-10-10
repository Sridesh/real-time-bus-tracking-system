require('dotenv').config();

const express = require('express');

const swaggerUI = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger.config');
const routes = require('./routes');
const redisService = require('./services/redis.service');
const { commonRateLimiter } = require('./middleware/rateLimiter.middleware');

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

// swagger docs
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpecs));

// API routes
app.use('/api', routes);

module.exports = app;
