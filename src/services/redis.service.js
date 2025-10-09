const redis = require('redis');
const logger = require('../config/logger.config');

class RedisService {
  constructor() {
    this.client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    this.client.on('error', (err) => {
      logger.error(' Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      logger.info('Redis connected');
    });
  }

  async connect() {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  async set(key, value, ttl = null) {
    if (ttl) {
      await this.client.setEx(key, ttl, JSON.stringify(value));
      logger.info('value set to redis');
      return;
    }
    return await this.client.set(key, JSON.stringify(value));
  }

  async get(key) {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async del(key) {
    await this.client.del(key);
    logger.info('value deleted from redis');
    return;
  }

  async exists(key) {
    return await this.client.exists(key);
  }
}

module.exports = new RedisService();
