const busRepository = require('../repositories/bus.repository.js');
const ApiError = require('../utils/ApiError.js');
const roles = require('../utils/roles.js');

/**
 * Bus Service - Contains business logic for bus operations
 * This layer validates, processes, and orchestrates data
 */
class BusService {
  /**
   * Get a bus by its ID
   * @param {string} busId - Bus ID
   * @returns {Promise<Object>} Bus data
   */
  async getBusById(busId) {
    const bus = await busRepository.findById(busId);

    if (!bus) {
      throw new ApiError(404, 'Bus not found');
    }

    return this.transformBusData(bus);
  }

  /**
   * Get all buses with pagination and filtering
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} Buses data with pagination
   */
  async getAllBuses(filters = {}, options = {}) {
    const query = this.buildQuery(filters);

    // Buses and total count
    const buses = await busRepository.findAll(query, options);
    const total = buses.length || 0;

    // Pagination data
    const { page = 1, limit = 20 } = options;
    const totalPages = Math.ceil(total / limit);

    return {
      buses: buses.map((bus) => this.transformBusData(bus)),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
      },
    };
  }

  /**
   * Create a new bus
   * @param {Object} busData - Bus data
   * @returns {Promise<Object>} Created bus
   */
  async createBus(busData) {
    // Check if registration number already exists
    const existingBus = await busRepository.findByRegistration(busData.registrationNumber);
    if (existingBus) {
      throw new ApiError(409, 'Registration number already exists');
    }

    // if (user.role === 'operator' && busData.operatorId !== user.operatorId) {
    //   throw new ApiError(403, 'You can only create buses for your own operator');
    // }

    // Create bus
    const bus = await busRepository.create(busData);

    return this.transformBusData(bus);
  }

  /**
   * Update a bus
   * @param {string} busId - Bus ID
   * @param {Object} updateData - Data to update
   * @param {Object} user - Authenticated user
   * @returns {Promise<Object>} Updated bus
   */
  async updateBus(busId, updateData, user) {
    // Validate ObjectId
    if (!this.isValidObjectId(busId)) {
      throw new ApiError(400, 'Invalid bus ID format');
    }

    // Get existing bus
    const existingBus = await busRepository.findById(busId);
    if (!existingBus) {
      throw new ApiError(404, 'Bus not found');
    }

    // Permission check
    if (user.role === roles.OPERATOR || user.role === roles.ADMIN) {
      if (existingBus.operatorId._id.toString() !== user.operatorId) {
        throw new ApiError(403, 'Insufficient permission');
      }
    }

    // Check uniqueness of registration number
    if (updateData.registrationNumber) {
      const existingRegNumber = await busRepository.findByRegistration(
        updateData.registrationNumber,
        busId
      );

      if (existingRegNumber) {
        throw new ApiError(409, 'Registration number already exists is a different bus');
      }
    }

    // Update bus
    const updatedBus = await busRepository.update(busId, updateData);

    if (!updatedBus) {
      throw new ApiError(404, 'Bus not found');
    }

    return this.transformBusData(updatedBus);
  }

  /**
   * Delete a bus
   * @param {string} busId - Bus ID
   * @param {Object} user - Authenticated user
   * @returns {Promise<void>}
   */
  async deleteBus(busId, user) {
    if (!this.isValidObjectId(busId)) {
      throw new ApiError(400, 'Invalid bus ID format');
    }

    // Get existing bus
    const existingBus = await busRepository.findById(busId);
    if (!existingBus) {
      throw new ApiError(404, 'Bus not found');
    }

    // Permission check
    if (user.role !== roles.ADMIN) {
      throw new ApiError(403, 'Insufficient permission');
    }

    await busRepository.delete(busId);
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

    // Operator filter
    if (filters.operatorId) {
      query.operatorId = filters.operatorId;
    }

    // Route filter
    if (filters.routeId) {
      query.routeId = filters.routeId;
    }

    // Manufacturer filter
    if (filters.manufacturer) {
      query.manufacturer = filters.manufacturer;
    }

    // Capacity range filter
    if (filters.minCapacity || filters.maxCapacity) {
      query.capacity = {};
      if (filters.minCapacity) {
        query.capacity.$gte = parseInt(filters.minCapacity);
      }
      if (filters.maxCapacity) {
        query.capacity.$lte = parseInt(filters.maxCapacity);
      }
    }

    // Feature filter
    if (filters.hasFeature) {
      query.features = filters.hasFeature;
    }

    // Search filter
    if (filters.search) {
      query.$or = [
        { registrationNumber: { $regex: filters.search, $options: 'i' } },
        { model: { $regex: filters.search, $options: 'i' } },
      ];
    }

    return query;
  }

  /**
   * Transform bus data (add computed fields, format dates, etc.)
   * @param {Object} bus - Raw bus data
   * @returns {Object} Transformed bus data
   */
  transformBusData(bus) {
    return {
      id: bus._id.toString(),
      registrationNumber: bus.registrationNumber,
      //   operator: bus.operatorId
      //     ? {
      //         id: bus.operatorId._id?.toString() || bus.operatorId,
      //         name: bus.operatorId.name,
      //         licenseNumber: bus.operatorId.licenseNumber,
      //         contactPerson: bus.operatorId.contactPerson,
      //         province: bus.operatorId.province,
      //       }
      //     : null,
      //   route: bus.routeId
      //     ? {
      //         id: bus.routeId._id?.toString() || bus.routeId,
      //         name: bus.routeId.name,
      //         routeNumber: bus.routeId.routeNumber,
      //         origin: bus.routeId.origin,
      //         destination: bus.routeId.destination,
      //       }
      //     : null,
      capacity: bus.capacity,
      status: bus.status,
      model: bus.model || null,
      manufacturer: bus.manufacturer || null,
      features: bus.features || [],
      //   licensePlateExpiry: bus.licensePlateExpiry || null,
      //   insuranceExpiry: bus.insuranceExpiry || null,
      isTracking: bus.isTracking || false,
      isRunning: bus.isRunning || false,
      createdAt: bus.createdAt,
      updatedAt: bus.updatedAt,
    };
  }

  /**
   * Validate MongoDB ObjectId
   * @param {string} id - ID to validate
   * @returns {boolean} Valid or not
   */
  isValidObjectId(id) {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }
}

module.exports = new BusService();
