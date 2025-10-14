const { isValidObjectId } = require('mongoose');
const ApiError = require('../utils/ApiError');
const { Stop } = require('../models/stop.model');

/**
 * Stop Service - Manages bus stops within routes
 */

class StopService {
  /**
   * Create a new stop
   * @param {Object} data - Stop data
   * @param {string} data.name - Stop name
   * @param {string} data.city - Stop city
   * @param {number} data.latitude - Stop latitude
   * @param {number} data.longitude - Stop longitude
   * @returns {Promise<Object>} Created stop
   */
  async create(data) {
    if (!data.name || !data.city || data.latitude === undefined || data.longitude === undefined) {
      throw new ApiError(400, 'Missing required fields: name, city, latitude, longitude');
    }

    const stop = await Stop.create({
      name: data.name.trim(),
      city: data.city.trim(),
      location: {
        type: 'Point',
        coordinates: [data.longitude, data.latitude],
      },
    });

    return stop.toObject();
  }

  /**
   * Get all stops (with optional search filter)
   * @param {string} [search] - Optional search query for stop name
   * @returns {Promise<Array>} List of stops
   */
  async findAll(search) {
    const query = {};

    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    const stops = await Stop.find(query).sort({ name: 1 });
    return stops;
  }

  /**
   * Get a single stop by ID
   * @param {string} stopId - Stop ID
   * @returns {Promise<Object>} Stop document
   */
  async findById(stopId) {
    if (!isValidObjectId(stopId)) {
      throw new ApiError(400, 'Invalid stop ID format');
    }

    const stop = await Stop.findById(stopId);
    if (!stop) throw new ApiError(404, 'Stop not found');
    return stop;
  }

  /**
   * Update a stop
   * @param {string} stopId - Stop ID
   * @param {Object} updateData - Data to update
   * @param {string} [updateData.name] - Stop name
   * @param {number} [updateData.latitude] - Stop latitude
   * @param {number} [updateData.longitude] - Stop longitude
   * @returns {Promise<Object>} Updated stop
   */
  async update(stopId, updateData) {
    if (!isValidObjectId(stopId)) {
      throw new ApiError(400, 'Invalid stop ID format');
    }

    const stop = await Stop.findById(stopId);
    if (!stop) throw new ApiError(404, 'Stop not found');

    if (updateData.name) stop.name = updateData.name.trim();
    if (updateData.latitude !== undefined) stop.location.latitude = updateData.latitude;
    if (updateData.longitude !== undefined) stop.location.longitude = updateData.longitude;

    await stop.save();
    return stop.toObject();
  }

  /**
   * Delete a stop
   * @param {string} stopId - Stop ID
   * @returns {Promise<Object>} Deleted stop confirmation
   */
  async delete(stopId) {
    if (!isValidObjectId(stopId)) {
      throw new ApiError(400, 'Invalid stop ID format');
    }
    const stop = await Stop.findByIdAndDelete(stopId);
    if (!stop) throw new ApiError(404, 'Stop not found');
    return { message: 'Stop deleted successfully' };
  }

  /**
   * Get nearby stops within a certain radius (in km)
   * @param {number} latitude - Center latitude
   * @param {number} longitude - Center longitude
   * @param {number} [radiusKm=1] - Search radius in kilometers
   * @returns {Promise<Array>} List of nearby stops
   */
  async findNearby(latitude, longitude, radiusKm = 1) {
    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new ApiError(400, 'Invalid latitude or longitude values');
    }

    // Convert km to radians (MongoDB uses radians for geospatial)
    const radiusInRadians = radiusKm / 6378.1;

    const stops = await Stop.find({
      location: {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], radiusInRadians],
        },
      },
    });

    return stops.map((stop) => ({
      id: stop._id,
      name: stop.name,
      city: stop.city,
      latitude: stop.location.coordinates[1],
      longitude: stop.location.coordinates[0],
    }));
  }
}

module.exports = new StopService();
