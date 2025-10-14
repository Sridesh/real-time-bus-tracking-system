const stopService = require('../services/stop.service');
const crypto = require('crypto');

/**
 * Stop Controller - Handles bus stop HTTP requests
 */

class StopController {
  /**
   * Create a new stop
   * Route: POST /api/v1/stops
   */
  async create(req, res, next) {
    try {
      const result = await stopService.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all stops (with optional search filter)
   * Route: GET /api/v1/stops?search=colombo
   */
  async getAll(req, res, next) {
    try {
      const { search } = req.query;
      const result = await stopService.findAll(search);

      // ETag for stops list
      const etag = crypto.createHash('md5').update(JSON.stringify(result)).digest('hex');
      res.set('ETag', etag);

      // Last-Modified: latest updatedAt among stops
      const lastModified = result.reduce((latest, stop) => {
        const updated = stop.updatedAt ? new Date(stop.updatedAt) : null;
        return updated && (!latest || updated > latest) ? updated : latest;
      }, null);
      if (lastModified) {
        res.set('Last-Modified', lastModified.toUTCString());
      }

      if (req.headers['if-none-match'] === etag) {
        return res.status(304).end();
      }
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
  }

  /**
   * Get a stop by ID
   * Route: GET /api/v1/stops/:stopId
   */
  async getById(req, res, next) {
    try {
      const result = await stopService.findById(req.params.stopId);

      // ETag for stop
      const etag = crypto.createHash('md5').update(JSON.stringify(result)).digest('hex');
      res.set('ETag', etag);

      if (result.updatedAt) {
        res.set('Last-Modified', new Date(result.updatedAt).toUTCString());
      }

      if (req.headers['if-none-match'] === etag) {
        return res.status(304).end();
      }
      if (req.headers['if-modified-since'] && result.updatedAt) {
        const since = new Date(req.headers['if-modified-since']);
        const updated = new Date(result.updatedAt);
        if (updated <= since) {
          return res.status(304).end();
        }
      }

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a stop
   * Route: PUT /api/v1/stops/:stopId
   */
  async update(req, res, next) {
    try {
      const result = await stopService.update(req.params.stopId, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a stop
   * Route: DELETE /api/v1/stops/:stopId
   */
  async delete(req, res, next) {
    try {
      const result = await stopService.delete(req.params.stopId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Find nearby stops
   * Route: GET /api/v1/stops/nearby?latitude=6.9271&longitude=79.8612&radius=2
   */
  async findNearby(req, res, next) {
    try {
      const { lat, lon, radius } = req.query;
      const result = await stopService.findNearby(
        parseFloat(lon),
        parseFloat(lat),
        parseFloat(radius) || 1
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StopController();
