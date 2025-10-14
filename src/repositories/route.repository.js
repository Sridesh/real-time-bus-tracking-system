/* eslint-disable no-useless-catch */
const Route = require('../models/route.model');
const Bus = require('../models/buses.model');

/**
 * Route Repository - Handles all route database operations
 */
class RouteRepository {
  /**
   * Create a new route
   * @param {Object} routeData - Route data
   * @returns {Promise<Object>} Created route
   */
  async create(routeData) {
    try {
      const route = await Route.create(routeData);
      return route.toObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find route by ID
   * @param {string} routeId - Route ID
   * @returns {Promise<Object|null>} Route or null
   */
  async findById(routeId) {
    try {
      return await Route.findById(routeId).lean();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find all routes with filters
   * @param {Object} filter - MongoDB filter object
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<Array>} Array of routes
   */
  async findAll(filter = {}, options = {}) {
    const { page = 1, limit = 20, sortBy = 'routeNumber', order = 'asc' } = options;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: order === 'asc' ? 1 : -1 };

    try {
      const routes = await Route.find(filter).sort(sort).skip(skip).limit(limit).lean();

      return routes;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Count routes matching filter
   * @param {Object} filter - MongoDB filter object
   * @returns {Promise<number>} Count
   */
  async count(filter = {}) {
    try {
      return await Route.countDocuments(filter);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find route by route number
   * @param {string} routeNumber - Route number
   * @param {string} excludeId - Route ID to exclude (for updates)
   * @returns {Promise<Object|null>} Route or null
   */
  async findByRouteNumber(routeNumber, excludeId = null) {
    try {
      const query = { routeNumber: routeNumber.toUpperCase() };
      if (excludeId) {
        query._id = { $ne: excludeId };
      }
      return await Route.findOne(query).lean();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update route by ID
   * @param {string} routeId - Route ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated route or null
   */
  async update(routeId, updateData) {
    try {
      const route = await Route.findByIdAndUpdate(
        routeId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).lean();

      return route;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete route by ID
   * @param {string} routeId - Route ID
   * @returns {Promise<Object|null>} Deleted route or null
   */
  async delete(routeId) {
    try {
      return await Route.findByIdAndDelete(routeId).lean();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find routes between cities
   * @param {string} origin - Origin city
   * @param {string} destination - Destination city
   * @returns {Promise<Array>} Routes
   */
  async findRoutesBetween(origin, destination) {
    try {
      return await Route.find({
        origin: new RegExp(origin, 'i'),
        destination: new RegExp(destination, 'i'),
        status: 'active',
      }).lean();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find routes by distance range
   * @param {number} minDistance - Minimum distance
   * @param {number} maxDistance - Maximum distance
   * @returns {Promise<Array>} Routes
   */
  async findByDistanceRange(minDistance, maxDistance) {
    try {
      return await Route.find({
        distance: { $gte: minDistance, $lte: maxDistance },
        status: 'active',
      }).lean();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get buses on a route
   * @param {string} routeId - Route ID
   * @returns {Promise<Array>} Buses on route
   */
  async getBusesOnRoute(routeId) {
    try {
      console.log(Bus);

      return await Bus.find({ routeId })
        // .populate('operatorId', 'name contactPerson')
        .lean();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if route number exists
   * @param {string} routeNumber - Route number
   * @returns {Promise<boolean>} True if exists
   */
  async routeNumberExists(routeNumber) {
    try {
      const count = await Route.countDocuments({
        routeNumber: routeNumber.toUpperCase(),
      });
      return count > 0;
    } catch (error) {
      throw error;
    }
  }

  async routesBetweenStops(originStop, destinationStop) {
    try {
      const routes = await Route.find({
        status: 'active',
        $and: [
          { 'stops.name': { $regex: originStop, $options: 'i' } },
          { 'stops.name': { $regex: destinationStop, $options: 'i' } },
        ],
      })
        .select('name routeNumber origin destination distance fare estimatedDuration stops')
        .lean();

      return routes;
    } catch (error) {
      throw error;
    }
  }

  async routesByStop(stopName) {
    try {
      const route = await Route.find({
        status: 'active',
        'stops.name': { $regex: stopName, $options: 'i' },
      })
        .select('name routeNumber origin destination distance fare operatingDays stops')
        .lean();

      return route;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new RouteRepository();
