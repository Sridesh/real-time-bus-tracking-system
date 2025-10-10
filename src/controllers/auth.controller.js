const bcrypt = require('bcrypt');

const userRepository = require('../repositories/user.repository');
const jwtService = require('../services/jwt.service');
const redisService = require('../services/redis.service');
const logger = require('../config/logger.config');

const signup = async (req, res) => {
  try {
    const { phone_number, password, role, email, name } = req.body;

    const user = await userRepository.createUser({
      phone_number,
      passwordHash: password,
      role,
      email,
      name,
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(error.code || 500).send(error.message || 'User creation failed');
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userRepository.getUserByEmail(email);

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const { token: accessToken } = await jwtService.generateAccessToken(user);
    const { token: refreshToken } = await jwtService.generateRefreshToken(user);

    res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    res.status(error.code || 500).send(error.message || 'Login failed');
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    const payload = jwtService.verifyRefreshToken(refresh_token, process.env.JWT_REFRESH_SECRET);
    const oldJti = payload.jti;

    // check redis
    const storedUserId = await redisService.get(`refresh:${oldJti}`);
    if (!storedUserId || payload._id !== storedUserId)
      return res.status(401).json({ message: 'Invalid refresh token' });

    // find user
    const user = await userRepository.getUserById(payload._id);
    if (!user) return res.status(401).json({ message: 'Invalid user' });

    // rotate
    await redisService.del(`refresh:${oldJti}`);

    const { token: accessToken } = await jwtService.generateAccessToken(user);
    const { token: refreshToken } = await jwtService.generateRefreshToken(user);

    res.status(200).json({ accessToken, refreshToken });
  } catch (err) {
    logger.error(err);
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

const logout = async (req, res) => {
  const { refresh_token } = req.body;

  try {
    const payload = jwtService.verifyRefreshToken(refresh_token, process.env.JWT_REFRESH_SECRET);
    const jti = payload.jti;
    await redisService.del(`refresh:${jti}`);
    res.json({ message: 'Logged out' });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ message: err.message || 'Could not logout' });
  }
};

module.exports = { signup, login, logout, refreshToken };
