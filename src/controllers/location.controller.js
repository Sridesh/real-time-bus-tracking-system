const logger = require('../config/logger.config');
const locationService = require('../services/location.service');

class LocationController {
  /**
   * Update Location
   * Route: POST /api/v1/location
   * Access: Public
   */
  updateLocation = async (req, res, next) => {
    try {
      const user = req.user;

      const locationData = req.body;

      const location = await locationService.updateLocation(locationData, user);
      logger.info('Location Updated for Bus ID: ' + locationData.busId);
      res.status(200).json(location);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get current Location of a bus
   * Route: GET /api/v1/location/:busId
   * Access: Public
   */
  getLocationByBus = async (req, res, next) => {
    try {
      const { busId } = req.params;

      const location = await locationService.getCurrentLocation(busId);
      res.status(200).json(location);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Find nearby buses to a location
   * Route: POST /api/v1/location/buses-nearby
   * Access: Public
   */
  getNearbyBuses = async (req, res, next) => {
    try {
      const { longitude, latitude, radius, options } = req.body;

      const nearbyBuses = await locationService.findNearbyBuses(
        longitude,
        latitude,
        radius,
        options
      );
      res.status(200).json(nearbyBuses);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GHet all active bus locations
   * Route: GET /api/v1/location/buses-active
   * Access: Public
   */
  getAllActiveBusLocations = async (_req, res, next) => {
    try {
      const locations = await locationService.getAllActiveBusLocations();
      res.status(200).json(locations);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get estimated time for bus arrival
   * Route: GET /api/v1/location/estimated-arrival
   * Access: Public
   */
  getEstimatedTime = async (req, res, next) => {
    try {
      const { busId, destLat, destLon } = req.query;
      const arrival = await locationService.estimateArrivalTime(busId, destLat, destLon);
      res.status(200).json(arrival);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get estimated time for multiple bus arrivals
   * Route: POST /api/v1/location/multiple-arrivals
   * Access: Public
   */
  getMultipleEstimatedTime = async (req, res, next) => {
    try {
      const { busIds, destLat, destLon } = req.body;
      const arrivals = await locationService.estimateArrivalTime(busIds, destLat, destLon);
      res.status(200).json(arrivals);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new LocationController();
