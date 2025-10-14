const { isValidObjectId } = require('mongoose');
const routeRepository = require('../repositories/route.repository');
const ApiError = require('../utils/ApiError');

/**
 * Route Service - Contains business logic for route operations
 */
class RouteService {
  /**
   * Get a route by ID
   * @param {string} routeId - Route ID
   * @returns {Promise<Object>} Route data
   */
  async getRouteById(routeId) {
    // Validate ObjectId format
    if (!isValidObjectId(routeId)) {
      throw new ApiError(400, 'Invalid route ID format');
    }

    const route = await routeRepository.findById(routeId);

    if (!route) {
      throw new ApiError(404, 'Route not found');
    }

    return this.transformRouteData(route);
  }

  /**
   * Get all routes with pagination and filtering
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} Routes data with pagination
   */
  async getAllRoutes(filters = {}, options = {}) {
    // Build query filter
    const query = this.buildQuery(filters);

    // Get routes and total count
    const [routes, total] = await Promise.all([
      routeRepository.findAll(query, options),
      routeRepository.count(query),
    ]);

    // Calculate pagination metadata
    const { page = 1, limit = 20 } = options;
    const totalPages = Math.ceil(total / limit);

    return {
      routes: routes.map((route) => this.transformRouteData(route)),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Create a new route
   * @param {Object} routeData - Route data
   * @returns {Promise<Object>} Created route
   */
  async createRoute(routeData) {
    // Check if route number already exists
    const existingRoute = await routeRepository.findByRouteNumber(routeData.routeNumber);
    if (existingRoute) {
      throw new ApiError(409, 'Route number already exists');
    }

    // Create route
    const route = await routeRepository.create(routeData);

    return this.transformRouteData(route);
  }

  /**
   * Update a route
   * @param {string} routeId - Route ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated route
   */
  async updateRoute(routeId, updateData) {
    // Validate ObjectId
    if (!isValidObjectId(routeId)) {
      throw new ApiError(400, 'Invalid route ID format');
    }

    // Check if route exists
    const existingRoute = await routeRepository.findById(routeId);
    if (!existingRoute) {
      throw new ApiError(404, 'Route not found');
    }

    // If route number is being updated, check uniqueness
    if (updateData.routeNumber) {
      const duplicate = await routeRepository.findByRouteNumber(updateData.routeNumber, routeId);
      if (duplicate) {
        throw new ApiError(409, 'Route number already exists');
      }
    }

    // Validate stops if provided
    if (updateData.stops && updateData.stops.length > 0) {
      this.validateStops(updateData.stops);
    }

    // Update route
    const updatedRoute = await routeRepository.update(routeId, updateData);

    if (!updatedRoute) {
      throw new ApiError(404, 'Route not found');
    }

    return this.transformRouteData(updatedRoute);
  }

  /**
   * Delete a route
   * @param {string} routeId - Route ID
   * @returns {Promise<void>}
   */
  async deleteRoute(routeId) {
    // Validate ObjectId
    if (!isValidObjectId(routeId)) {
      throw new ApiError(400, 'Invalid route ID format');
    }

    // Check if route exists
    const existingRoute = await routeRepository.findById(routeId);
    if (!existingRoute) {
      throw new ApiError(404, 'Route not found');
    }

    // Check if there are buses on this route
    const buses = await routeRepository.getBusesOnRoute(routeId);
    if (buses && buses.length > 0) {
      throw new ApiError(
        400,
        `Cannot delete route. ${buses.length} bus(es) are currently assigned to this route.`
      );
    }

    // Delete route
    await routeRepository.delete(routeId);
  }

  /**
   * Get buses on a route
   * @param {string} routeId - Route ID
   * @returns {Promise<Array>} Buses on route
   */
  async getBusesOnRoute(routeId) {
    // Validate ObjectId
    if (!isValidObjectId(routeId)) {
      throw new ApiError(400, 'Invalid route ID format');
    }

    // Check if route exists
    const route = await routeRepository.findById(routeId);
    if (!route) {
      throw new ApiError(404, 'Route not found');
    }

    // Get buses
    const buses = await routeRepository.getBusesOnRoute(routeId);

    return buses.map((bus) => ({
      id: bus._id.toString(),
      registrationNumber: bus.registrationNumber,
      capacity: bus.capacity,
      status: bus.status,
      model: bus.model,
      routeId: bus.routeId,
      // operator: bus.operatorId
      //   ? {
      //       id: bus.operatorId._id.toString(),
      //       name: bus.operatorId.name,
      //       contactPerson: bus.operatorId.contactPerson,
      //     }
      //   : null,
    }));
  }

  //TODO
  /**
   * Get all stops for a route
   * @param {string} routeId - Route ID
   * @returns {Promise<Array>} Array of stops
   */
  async getStopsByRoute(routeId) {
    if (!this.isValidObjectId(routeId)) {
      throw new ApiError(400, 'Invalid route ID format');
    }

    const route = await routeRepository.findById(routeId);

    if (!route) {
      throw new ApiError(404, 'Route not found');
    }

    return route.stops.map((stop) => ({
      name: stop.name,
      city: stop.city,
      latitude: stop.location.coordinates[1],
      longitude: stop.location.coordinates[0],
      estimatedArrival: stop.estimatedArrival || 0,
    }));
  }

  /**
   * Build MongoDB query from filters
   * @param {Object} filters - Filter object
   * @returns {Object} MongoDB query
   */
  buildQuery(filters) {
    const query = {};

    // Status filter
    if (filters.status) {
      query.status = filters.status;
    }

    // Origin filter (case-insensitive partial match)
    if (filters.origin) {
      query.origin = { $regex: filters.origin, $options: 'i' };
    }

    // Destination filter (case-insensitive partial match)
    if (filters.destination) {
      query.destination = { $regex: filters.destination, $options: 'i' };
    }

    // Distance range filter
    if (filters.minDistance || filters.maxDistance) {
      query.distance = {};
      if (filters.minDistance) {
        query.distance.$gte = parseFloat(filters.minDistance);
      }
      if (filters.maxDistance) {
        query.distance.$lte = parseFloat(filters.maxDistance);
      }
    }

    // Fare range filter
    if (filters.minFare || filters.maxFare) {
      query.fare = {};
      if (filters.minFare) {
        query.fare.$gte = parseFloat(filters.minFare);
      }
      if (filters.maxFare) {
        query.fare.$lte = parseFloat(filters.maxFare);
      }
    }

    // Operating day filter
    if (filters.operatingDay) {
      query.operatingDays = filters.operatingDay;
    }

    // Search filter (name, route number, origin, destination)
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { routeNumber: { $regex: filters.search, $options: 'i' } },
        { origin: { $regex: filters.search, $options: 'i' } },
        { destination: { $regex: filters.search, $options: 'i' } },
      ];
    }

    return query;
  }

  /**
   * Transform route data
   * @param {Object} route - Raw route data
   * @returns {Object} Transformed route data
   */
  transformRouteData(route) {
    return {
      id: route._id.toString(),
      name: route.name,
      routeNumber: route.routeNumber,
      origin: route.origin,
      destination: route.destination,
      distance: route.distance,
      estimatedDuration: route.estimatedDuration,
      stops: route.stops
        ? route.stops.map((stop) => ({
            name: stop.name,
            city: stop.city,
            latitude: stop.location.coordinates[1], // GeoJSON stores [lng, lat]
            longitude: stop.location.coordinates[0],
            estimatedArrival: stop.estimatedArrival || 0,
          }))
        : [],
      totalStops: route.stops ? route.stops.length : 0,
      fare: route.fare,
      operatingDays: route.operatingDays || [],
      startTime: route.startTime || null,
      endTime: route.endTime || null,
      frequency: route.frequency || null,
      status: route.status,
      averageSpeed: route.estimatedDuration
        ? Math.round((route.distance / (route.estimatedDuration / 60)) * 10) / 10
        : 0,
      isOperatingToday: this.isOperatingToday(route),
      createdAt: route.createdAt,
      updatedAt: route.updatedAt,
    };
  }

  /**
   * Check if route operates today
   * @param {Object} route - Route object
   * @returns {boolean} True if operating today
   */
  isOperatingToday(route) {
    if (route.status !== 'active') return false;

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return route.operatingDays && route.operatingDays.includes(today);
  }

  /**
   * Check if coordinates are in Sri Lanka
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {boolean} True if in Sri Lanka
   */
  isInSriLanka(latitude, longitude) {
    console.log(latitude, longitude);

    const bounds = {
      minLat: 5.9,
      maxLat: 9.9,
      minLon: 79.5,
      maxLon: 82.0,
    };

    return (
      latitude >= bounds.minLat &&
      latitude <= bounds.maxLat &&
      longitude >= bounds.minLon &&
      longitude <= bounds.maxLon
    );
  }

  //   /**
  //    * Validate MongoDB ObjectId
  //    * @param {string} id - ID to validate
  //    * @returns {boolean} Valid or not
  //    */
  //   isValidObjectId(id) {
  //     return /^[0-9a-fA-F]{24}$/.test(id);
  //   }
}

module.exports = new RouteService();
