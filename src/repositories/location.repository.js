/* eslint-disable no-useless-catch */
const Location = require('../models/location.model');

/**
 * Location Repository - Handles all GPS location database operations
 */
class LocationRepository {
  /**
   * Create a new location record
   * @param {Object} locationData - Location data
   * @returns {Promise<Object>} Created location
   */
  async create(locationData) {
    try {
      const location = await Location.create(locationData);
      return location.toObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find location by ID
   * @param {string} locationId - Location ID
   * @returns {Promise<Object|null>} Location or null
   */
  async findById(locationId) {
    try {
      return await Location.findById(locationId)
        .populate('busId', 'registrationNumber capacity status')
        .populate('routeId', 'name routeNumber origin destination')
        .lean();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get latest location for a specific bus
   * @param {string} busId - Bus ID
   * @returns {Promise<Object|null>} Latest location or null
   */
  async getLatestByBusId(busId) {
    try {
      return await Location.findOne({ busId })
        .sort({ timestamp: -1 })
        .populate('busId', 'registrationNumber capacity status model')
        // .populate('routeId', 'name routeNumber origin destination')
        .lean();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get location history for a bus
   * @param {string} busId - Bus ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of locations
   */
  async getHistoryByBusId(busId, options = {}) {
    try {
      const { startDate, endDate, page = 1, limit = 100 } = options;

      const query = { busId };

      // Date range filter
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }

      const skip = (page - 1) * limit;

      const locations = await Location.find(query)
        .sort({ timestamp: 1 }) // Oldest first for route replay
        .skip(skip)
        .limit(limit)
        .lean();

      return locations;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find buses near a location (geospatial query)
   * @param {number} longitude - Center longitude
   * @param {number} latitude - Center latitude
   * @param {number} radiusKm - Search radius in kilometers
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} Nearby buses with distances
   */
  async findNearby(longitude, latitude, radiusKm = 5, options = {}) {
    try {
      const { routeId, status, limit = 50 } = options;

      // Build aggregation pipeline
      const pipeline = [
        // Geospatial search
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            distanceField: 'distance',
            maxDistance: radiusKm * 1000, // Convert km to meters
            spherical: true,
            key: 'location',
          },
        },
        // Only get recent locations (last 10 minutes)
        {
          $match: {
            timestamp: { $gte: new Date(Date.now() - 10 * 60 * 1000) },
          },
        },
        // Sort by timestamp (latest first) for each bus
        { $sort: { busId: 1, timestamp: -1 } },
        // Group by bus to get only latest location per bus
        {
          $group: {
            _id: '$busId',
            location: { $first: '$$ROOT' },
          },
        },
        // Replace root with location document
        { $replaceRoot: { newRoot: '$location' } },
        // Lookup bus details
        {
          $lookup: {
            from: 'buses',
            localField: 'busId',
            foreignField: '_id',
            as: 'bus',
          },
        },
        { $unwind: '$bus' },
        // Lookup route details
        {
          $lookup: {
            from: 'routes',
            localField: 'routeId',
            foreignField: '_id',
            as: 'route',
          },
        },
        {
          $unwind: {
            path: '$route',
            preserveNullAndEmptyArrays: true,
          },
        },
      ];

      // Add filters
      const matchStage = {};
      if (routeId) matchStage['route._id'] = routeId;
      if (status) matchStage['bus.status'] = status;

      if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
      }

      // Limit results
      pipeline.push({ $limit: limit });

      const results = await Location.aggregate(pipeline);

      return results;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get latest locations for all active buses
   * @returns {Promise<Array>} Latest locations
   */
  async getLatestForAllBuses() {
    try {
      return await Location.aggregate([
        // Only recent locations (last 30 minutes)
        {
          $match: {
            timestamp: { $gte: new Date(Date.now() - 30 * 60 * 1000) },
          },
        },
        // Sort by timestamp descending
        { $sort: { timestamp: -1 } },
        // Group by busId and get first (latest) document
        {
          $group: {
            _id: '$busId',
            latestLocation: { $first: '$$ROOT' },
          },
        },
        // Replace root with the latest location
        { $replaceRoot: { newRoot: '$latestLocation' } },
        // Lookup bus details
        {
          $lookup: {
            from: 'buses',
            localField: 'busId',
            foreignField: '_id',
            as: 'bus',
          },
        },
        { $unwind: '$bus' },
        // Only active buses
        { $match: { 'bus.status': 'active' } },
      ]);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calculate distance traveled by a bus
   * @param {string} busId - Bus ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<number>} Distance in kilometers
   */
  async calculateDistanceTraveled(busId, startDate, endDate) {
    try {
      const locations = await Location.find({
        busId,
        timestamp: { $gte: startDate, $lte: endDate },
      })
        .sort({ timestamp: 1 })
        .select('latitude longitude')
        .lean();

      if (locations.length < 2) return 0;

      let totalDistance = 0;

      for (let i = 1; i < locations.length; i++) {
        const prev = locations[i - 1];
        const curr = locations[i];

        // Haversine formula
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(curr.latitude - prev.latitude);
        const dLon = this.toRad(curr.longitude - prev.longitude);

        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(this.toRad(prev.latitude)) *
            Math.cos(this.toRad(curr.latitude)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        totalDistance += R * c;
      }

      return Math.round(totalDistance * 100) / 100;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get average speed for a bus in a time period
   * @param {string} busId - Bus ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<number>} Average speed in km/h
   */
  async getAverageSpeed(busId, startDate, endDate) {
    try {
      const result = await Location.aggregate([
        {
          $match: {
            busId,
            timestamp: { $gte: startDate, $lte: endDate },
            isMoving: true,
          },
        },
        {
          $group: {
            _id: null,
            avgSpeed: { $avg: '$speed' },
          },
        },
      ]);

      return result.length > 0 ? Math.round(result[0].avgSpeed * 10) / 10 : 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete old locations (cleanup)
   * @param {number} daysToKeep - Days to keep
   * @returns {Promise<Object>} Deletion result
   */
  async deleteOldLocations(daysToKeep = 30) {
    try {
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
      return await Location.deleteMany({ createdAt: { $lt: cutoffDate } });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Helper: Convert degrees to radians
   */
  toRad(degrees) {
    return (degrees * Math.PI) / 180;
  }
}

module.exports = new LocationRepository();
