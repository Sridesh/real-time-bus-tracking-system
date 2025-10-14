const logger = require('../config/logger.config.js');
const busService = require('../services/bus.service.js');
const crypto = require('crypto');

/**
 * Bus Controller - Handles HTTP requests and responses
 */
class BusController {
  /**
   * Get bus by ID
   * Route: GET /api/v1/buses/:busId
   * Access: Public
   */
  getBusById = async (req, res, next) => {
    try {
      const { busId } = req.params;
      const bus = await busService.getBusById(busId);

      // Generate ETag from bus data
      const etag = crypto.createHash('md5').update(JSON.stringify(bus)).digest('hex');
      res.set('ETag', etag);

      // Set Last-Modified header
      if (bus.updatedAt) {
        res.set('Last-Modified', new Date(bus.updatedAt).toUTCString());
      }

      // Conditional GET: ETag
      if (req.headers['if-none-match'] === etag) {
        return res.status(304).end();
      }

      // Conditional GET: Last-Modified
      if (req.headers['if-modified-since'] && bus.updatedAt) {
        const since = new Date(req.headers['if-modified-since']);
        const updated = new Date(bus.updatedAt);
        if (updated <= since) {
          return res.status(304).end();
        }
      }

      return res.status(200).json(bus);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all buses with filtering, sorting, and pagination
   * Route: GET /api/v1/buses
   * Access: Public
   */
  getAllBuses = async (req, res, next) => {
    try {
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

      // Generate ETag from buses array
      const etag = crypto.createHash('md5').update(JSON.stringify(result.buses)).digest('hex');
      res.set('ETag', etag);

      // Find latest updatedAt among all buses
      const lastModified = result.buses.reduce((latest, bus) => {
        const updated = bus.updatedAt ? new Date(bus.updatedAt) : null;
        return updated && (!latest || updated > latest) ? updated : latest;
      }, null);
      if (lastModified) {
        res.set('Last-Modified', lastModified.toUTCString());
      }

      // Conditional GET: ETag
      if (req.headers['if-none-match'] === etag) {
        return res.status(304).end();
      }

      // Conditional GET: Last-Modified
      if (req.headers['if-modified-since'] && lastModified) {
        const since = new Date(req.headers['if-modified-since']);
        if (lastModified <= since) {
          return res.status(304).end();
        }
      }

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create new bus
   * Route: POST /api/v1/buses
   * Access: Private (Operator/Admin)
   */
  createBus = async (req, res, next) => {
    try {
      const busData = req.body;
      const user = req.user;

      const bus = await busService.createBus(busData, user);
      logger.info('Bus created');
      return res.status(201).json(bus);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update bus
   * Route: PUT /api/v1/buses/:busId
   * Access: Private (Operator/Admin)
   */
  updateBus = async (req, res, next) => {
    try {
      const { busId } = req.params;
      const updateData = req.body;
      const user = req.user;

      const bus = await busService.updateBus(busId, updateData, user);

      return res.status(200).json(bus);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete bus
   * Route: DELETE /api/v1/buses/:busId
   * Access: Private (Admin only)
   */
  deleteBus = async (req, res, next) => {
    try {
      const { busId } = req.params;
      const user = req.user;

      await busService.deleteBus(busId, user);

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new BusController();
