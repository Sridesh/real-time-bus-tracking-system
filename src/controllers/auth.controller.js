const bcrypt = require('bcrypt');

const userRepository = require('../repositories/user.repository');
const jwtService = require('../services/jwt.service');
const redisService = require('../services/redis.service');

const signup = async (req, res, next) => {
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
    next(error);
  }
};

const login = async (req, res, next) => {
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
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
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
    next(err);
  }
};

const logout = async (req, res, next) => {
  const { refresh_token } = req.body;

  try {
    const payload = jwtService.verifyRefreshToken(refresh_token, process.env.JWT_REFRESH_SECRET);
    const jti = payload.jti;
    await redisService.del(`refresh:${jti}`);
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, logout, refreshToken };
