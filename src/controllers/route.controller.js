const logger = require('../config/logger.config');
const routeService = require('../services/route.service');

/**
 * @desc Get all routes with optional filters and pagination
 * @route GET /api/v1/routes
 */
exports.getAllRoutes = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      origin: req.query.origin,
      destination: req.query.destination,
      minDistance: req.query.minDistance,
      maxDistance: req.query.maxDistance,
      minFare: req.query.minFare,
      maxFare: req.query.maxFare,
      operatingDay: req.query.operatingDay,
      search: req.query.search,
    };

    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      sortBy: req.query.sortBy || 'routeNumber',
      order: req.query.order || 'asc',
    };

    const result = await routeService.getAllRoutes(filters, options);
    res.status(200).json(result);
  } catch (err) {
    logger.error({ err }, 'Error getting routes');
    next(err);
  }
};

/**
 * @desc Get a single route by ID
 * @route GET /api/v1/routes/:id
 */
exports.getRouteById = async (req, res, next) => {
  try {
    const route = await routeService.getRouteById(req.params.id);
    res.status(200).json(route);
  } catch (err) {
    logger.error({ err, routeId: req.params.id }, 'Error getting route by ID');
    next(err);
  }
};

/**
 * @desc Create a new route
 * @route POST /api/v1/routes
 */
exports.createRoute = async (req, res, next) => {
  try {
    const route = await routeService.createRoute(req.body);
    logger.info({ routeId: route.id }, 'Route created');
    res.status(201).json(route);
  } catch (err) {
    logger.error({ err }, 'Error creating route');
    next(err);
  }
};

/**
 * @desc Update an existing route
 * @route PUT /api/v1/routes/:id
 */
exports.updateRoute = async (req, res, next) => {
  try {
    const updatedRoute = await routeService.updateRoute(req.params.id, req.body);
    logger.info({ routeId: updatedRoute.id }, 'Route updated');
    res.status(200).json(updatedRoute);
  } catch (err) {
    logger.error({ err, routeId: req.params.id }, 'Error updating route');
    next(err);
  }
};

/**
 * @desc Delete a route by ID
 * @route DELETE /api/v1/routes/:id
 */
exports.deleteRoute = async (req, res, next) => {
  try {
    await routeService.deleteRoute(req.params.id);
    logger.info({ routeId: req.params.id }, 'Route deleted');
    res.status(200).json({ message: 'Route deleted successfully' });
  } catch (err) {
    logger.error({ err, routeId: req.params.id }, 'Error deleting route');
    next(err);
  }
};

/**
 * @desc Get all buses assigned to a route
 * @route GET /api/v1/routes/:id/buses
 */
exports.getBusesOnRoute = async (req, res, next) => {
  try {
    const buses = await routeService.getBusesOnRoute(req.params.id);
    res.status(200).json(buses);
  } catch (err) {
    logger.error({ err, routeId: req.params.id }, 'Error getting buses for route');
    next(err);
  }
};
