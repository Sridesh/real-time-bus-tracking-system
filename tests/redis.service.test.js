const RedisService = require('../src/services/redis.service');

describe('RedisService', () => {
  const key = 'test-key';
  const value = { foo: 'bar' };

  beforeAll(async () => {
    await RedisService.connect();
  });

  afterAll(async () => {
    await RedisService.del(key);
  });

  it('should set and get a value', async () => {
    await RedisService.set(key, value);
    const result = await RedisService.get(key);
    expect(result).toEqual(value);
  });

  it('should set and get a value with TTL', async () => {
    await RedisService.set(key, value, 2);
    const result = await RedisService.get(key);
    expect(result).toEqual(value);
  });

  it('should delete a value', async () => {
    await RedisService.set(key, value);
    await RedisService.del(key);
    const result = await RedisService.get(key);
    expect(result).toBeNull();
  });

  it('should check existence', async () => {
    await RedisService.set(key, value);
    const exists = await RedisService.exists(key);
    expect(exists).toBe(1);
    await RedisService.del(key);
    const notExists = await RedisService.exists(key);
    expect(notExists).toBe(0);
  });
});
