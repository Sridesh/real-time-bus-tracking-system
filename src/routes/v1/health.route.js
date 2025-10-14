const express = require('express');
const mongoose = require('mongoose');
const redisService = require('../../services/redis.service');

const router = express.Router();

router.get('/', async (_req, res) => {
  // MongoDB health
  const mongoStatus = mongoose.connection.readyState === 1 ? 'up' : 'down';

  // Redis health
  let redisStatus = 'down';
  try {
    await redisService.client.ping();
    redisStatus = 'up';
  } catch {
    redisStatus = 'down';
  }

  res.status(200).json({
    status: 'ok',
    mongo: mongoStatus,
    redis: redisStatus,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
