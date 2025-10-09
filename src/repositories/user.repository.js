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

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User document or null
   */
  async getUserByEmail(email) {
    // eslint-disable-next-line no-useless-catch
    try {
      let query = User.findOne({ email: email.toLowerCase() });
      return await query.lean();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find user by email
   * @param {string} id - User id
   * @returns {Promise<Object|null>} User document or null
   */
  async getUserById(id) {
    // eslint-disable-next-line no-useless-catch
    try {
      let query = User.findOne({ _id: id });
      return await query.lean();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserRepository();
