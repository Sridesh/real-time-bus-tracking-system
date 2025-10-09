require('dotenv').config();

const express = require('express');

const swaggerUI = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger.config');
const routes = require('./routes');
const redisService = require('./services/redis.service');

const app = express();

// redis
const connectRedis = async () => {
  await redisService.connect();
};
connectRedis();

// middleware
app.use(express.json());

// swagger docs
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpecs));

// API routes
app.use('/api', routes);

module.exports = app;
