const stopService = require('../services/stop.service');

/**
 * Stop Controller - Handles bus stop HTTP requests
 */

class StopController {
  /**
   * Create a new stop
   * Route: POST /api/v1/stops
   */
  async create(req, res) {
    try {
      const result = await stopService.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  /**
   * Get all stops (with optional search filter)
   * Route: GET /api/v1/stops?search=colombo
   */
  async getAll(req, res) {
    try {
      const { search } = req.query;
      const result = await stopService.findAll(search);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  /**
   * Get a stop by ID
   * Route: GET /api/v1/stops/:stopId
   */
  async getById(req, res) {
    try {
      const result = await stopService.findById(req.params.stopId);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  /**
   * Update a stop
   * Route: PUT /api/v1/stops/:stopId
   */
  async update(req, res) {
    try {
      const result = await stopService.update(req.params.stopId, req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  /**
   * Delete a stop
   * Route: DELETE /api/v1/stops/:stopId
   */
  async delete(req, res) {
    try {
      const result = await stopService.delete(req.params.stopId);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  /**
   * Find nearby stops
   * Route: GET /api/v1/stops/nearby?latitude=6.9271&longitude=79.8612&radius=2
   */
  async findNearby(req, res) {
    try {
      const { lat, lon, radius } = req.query;
      const result = await stopService.findNearby(
        parseFloat(lon),
        parseFloat(lat),
        parseFloat(radius) || 1
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
}

module.exports = new StopController();
