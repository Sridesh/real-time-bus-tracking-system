const logger = require('../config/logger.config.js');
const busService = require('../services/bus.service.js');

/**
 * Bus Controller - Handles HTTP requests and responses
 */
class BusController {
  /**
   * Get bus by ID
   * Route: GET /api/v1/buses/:busId
   * Access: Public
   */
  getBusById = async (req, res) => {
    const { busId } = req.params;

    const bus = await busService.getBusById(busId);

    return res.status(200).json(bus);
  };

  /**
   * Get all buses with filtering, sorting, and pagination
   * Route: GET /api/v1/buses
   * Access: Public
   */
  getAllBuses = async (req, res) => {
    // Extract query parameters (already validated by middleware)
    const {
      page,
      limit,
      sortBy,
      order,
      status,
      // operatorId,
      // routeId,
      minCapacity,
      maxCapacity,
      search,
    } = req.query;

    const filters = {
      status,
      // operatorId,
      // routeId,
      minCapacity,
      maxCapacity,
      search,
    };

    //  options
    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      sortBy: sortBy || 'createdAt',
      order: order || 'desc',
    };

    const result = await busService.getAllBuses(filters, options);

    res.status(200).json(result);
  };

  /**
   * Create new bus
   * Route: POST /api/v1/buses
   * Access: Private (Operator/Admin)
   */
  createBus = async (req, res) => {
    try {
      const busData = req.body;
      const user = req.user;

      const bus = await busService.createBus(busData, user);
      logger.info('Bus created');
      return res.status(201).json(bus);
    } catch (error) {
      console.log(error.message);

      res.status(error.statusCode || 500).send(error.message);
    }
  };

  /**
   * Update bus
   * Route: PUT /api/v1/buses/:busId
   * Access: Private (Operator/Admin)
   */
  updateBus = async (req, res) => {
    const { busId } = req.params;
    const updateData = req.body;
    const user = req.user;

    const bus = await busService.updateBus(busId, updateData, user);

    return res.status(200).json(bus);
  };

  /**
   * Delete bus
   * Route: DELETE /api/v1/buses/:busId
   * Access: Private (Admin only)
   */
  deleteBus = async (req, res) => {
    try {
      const { busId } = req.params;
      const user = req.user;
      console.log(user);

      await busService.deleteBus(busId, user);

      return res.status(204).send();
    } catch (error) {
      console.log(error);
    }
  };
}

module.exports = new BusController();
