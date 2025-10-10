const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const redisService = require('./redis.service');

/**
 * Token Service - Handles JWT token generation, validation and rotation
 */
class JwtService {
  accessSecret = process.env.JWT_ACCESS_SECRET;
  refreshSecret = process.env.JWT_REFRESH_SECRET;
  accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRE;
  refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRE;
  algorithm = 'HS256';

  /**
   * Generate access token
   * @param {Object} payload - Token payload (_id, email, role)
   * @returns {string} JWT access token
   */
  async generateAccessToken(payload) {
    // eslint-disable-next-line no-useless-catch
    try {
      const jti = uuidv4();
      const { _id, role } = payload;
      const token = jwt.sign(
        {
          _id,
          role,
          type: 'access',
          jti,
        },
        this.accessSecret,
        {
          expiresIn: this.accessTokenExpiry,
          algorithm: this.algorithm,
        }
      );

      return { token, jti };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate refresh token
   * @param {Object} payload - Token payload (_id, email, role)
   * @returns {string} JWT refresh token
   */
  async generateRefreshToken(payload) {
    // eslint-disable-next-line no-useless-catch
    try {
      const jti = uuidv4();
      const { _id, role } = payload;

      const token = jwt.sign(
        {
          _id,
          role,
          type: 'refresh',
          jti,
        },
        this.refreshSecret,
        {
          expiresIn: this.refreshTokenExpiry,
          algorithm: this.algorithm,
        }
      );

      await redisService.set(`refresh:${jti}`, String(_id), 60 * 60 * 24 * 30);
      return { token, jti };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate refresh token
   * @param {Object} payload - Token payload (_id, email, role)
   * @param {String} oldJti - jti of old refresh token
   * @returns {string} JWT refresh token
   */
  async rotateRefreshToken(payload, oldJti) {
    await redisService.del(`refresh:${oldJti}`);
    return this.generateRefreshToken(payload);
  }

  /**
   * Verify access token
   * @param {string} token - JWT token
   * @returns {Object} Decoded token payload
   * @throws {Error} If token is invalid
   */
  verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, this.accessSecret);

      // Check if token type is correct
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Access token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid access token');
      }
      throw new Error('Token verification failed');
    }
  }

  /**
   * Verify refresh token
   * @param {string} token - Refresh token
   * @returns {Object} Decoded token payload
   * @throws {Error} If token is invalid
   */
  verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, this.refreshSecret);

      // Check if token type is correct
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Refresh token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid or expired refresh token');
      }
      throw new Error('Token verification failed');
    }
  }

  /**
   * Decode token without verification (for debugging)
   * @param {string} token - JWT token
   * @returns {Object} Decoded payload
   */
  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is expired
   * @param {string} token - JWT token
   * @returns {boolean} True if expired
   */
  isTokenExpired(token) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return true;

      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }
}

module.exports = new JwtService();
