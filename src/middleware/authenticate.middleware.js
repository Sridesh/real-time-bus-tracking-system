const jwt = require('jsonwebtoken');

const logger = require('../config/logger.config');

/**
 * Authentication middleware
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // remove 'Bearer ' part
  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = {
      id: payload.sub,
      role: payload.role,
      jti: payload.jti,
    };
    next();
  } catch (err) {
    logger.error(err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authenticate;
