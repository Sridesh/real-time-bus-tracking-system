/* eslint-disable no-useless-catch */
const Bus = require('../models/buses.model');

/**
 * Bus Repository - Handles all database operations for buses
 */
class BusRepository {
  /**
   * Find bus by ID
   * @param {string} busId - Bus  ObjectId
   * @returns {Promise<Object|null>} - Bus document or null
   */
  async findById(busId) {
    try {
      const bus = await Bus.findById(busId)
        // .populate('operatorId', 'name licenseNumber') // Get operator details
        // .populate('routeId', 'name routeNumber origin destination') // Get route details
        .lean(); // Convert to JS object

      return bus;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find all buses with filters
   * @param {Object} filter - MongoDB filter object
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<Array>} - Array of bus documents
   */
  async findAll(filter = {}, options = {}) {
    const { page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = options;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: order === 'desc' ? -1 : 1 };

    try {
      const buses = await Bus.find(filter)
        // .populate('operatorId', 'name licenseNumber contactPerson province')
        // .populate('routeId', 'name routeNumber origin destination')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      return buses;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find buses by registration number (for uniqueness check)
   * @param {string} registrationNumber - Registration number
   * @param {string} excludeId - Bus ID to exclude (for updates)
   * @returns {Promise<Object|null>} Bus or null
   */
  async findByRegistration(registrationNumber, excludeId = null) {
    try {
      const query = { registrationNumber: registrationNumber.toLowerCase() };
      if (excludeId) {
        query._id = { $ne: excludeId };
      }
      return await Bus.findOne(query).lean();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Count total buses matching filter
   * @param {Object} filter - MongoDB filter object
   * @returns {Promise<number>} Count of documents
   */
  async count(filter = {}) {
    try {
      return await Bus.countDocuments(filter);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new bus
   * @param {Object} busData - Bus data
   * @returns {Promise<Object>} Created bus document
   */
  async create(busData) {
    try {
      const bus = await Bus.create(busData);
      return bus.toObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a bus by ID
   * @param {string} busId - Bus MongoDB ObjectId
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated bus or null
   */
  async update(busId, updateData) {
    try {
      const bus = await Bus.findByIdAndUpdate(
        busId,
        { $set: updateData },
        { new: true, runValidators: true } // Return updated doc, validate
      )
        // .populate('operatorId', 'name')
        // .populate('routeId', 'name routeNumber')
        .lean();

      return bus;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a bus by ID
   * @param {string} busId - Bus MongoDB ObjectId
   * @returns {Promise<Object|null>} Deleted bus or null
   */
  async delete(busId) {
    try {
      const bus = await Bus.findByIdAndDelete(busId).lean();
      return bus;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if bus exists by registration number
   * @param {string} registrationNumber - Registration number
   * @returns {Promise<boolean>} True if exists
   */
  async existsByRegistration(registrationNumber) {
    try {
      const count = await Bus.countDocuments({ registrationNumber });
      return count > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new BusRepository();
