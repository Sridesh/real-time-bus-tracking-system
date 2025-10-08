const User = require('../models/user.model');

/**
 * User Repository - Handles all database operations related ot User model
 */
class UserRepository {
  /**
   * Create User
   * @param {Object} uerData - User data
   * @returns {Promise<Object>} Created user documents
   */
  async createUser(userData) {
    return User.create(userData);
  }
}

module.exports = new UserRepository();
