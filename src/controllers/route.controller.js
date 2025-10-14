const logger = require('../config/logger.config');
const routeService = require('../services/route.service');
const crypto = require('crypto');

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

    // ETag for routes list
    const etag = crypto.createHash('md5').update(JSON.stringify(result.routes)).digest('hex');
    res.set('ETag', etag);

    // Last-Modified: latest updatedAt among routes
    const lastModified = result.routes.reduce((latest, route) => {
      const updated = route.updatedAt ? new Date(route.updatedAt) : null;
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
  } catch (err) {
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

    // ETag for route
    const etag = crypto.createHash('md5').update(JSON.stringify(route)).digest('hex');
    res.set('ETag', etag);

    if (route.updatedAt) {
      res.set('Last-Modified', new Date(route.updatedAt).toUTCString());
    }

    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }
    if (req.headers['if-modified-since'] && route.updatedAt) {
      const since = new Date(req.headers['if-modified-since']);
      const updated = new Date(route.updatedAt);
      if (updated <= since) {
        return res.status(304).end();
      }
    }

    res.status(200).json(route);
  } catch (err) {
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
    next(err);
  }
};

/**
 * @desc Get all stops in a route
 * @route GET /api/v1/routes/:id/stops
 */
exports.getStopsByRoute = async (req, res, next) => {
  try {
    const stops = await routeService.getStopsByRoute(req.params.id);
    res.status(200).json(stops);
  } catch (err) {
    next(err);
  }
};

/**
 * Get all stops for a route
 * Route: GET /api/v1/routes/:routeId/stops
 * Access: Public
 */
exports.getStopsByRoute = async (req, res, next) => {
  try {
    const { id } = req.params;

    const stops = await routeService.getStopsByRoute(id);

    return res.status(200).json(stops);
  } catch (error) {
    next(error);
  }
};

/**
 * Find routes by  stops
 * Route: GET /api/v1/routes/stops
 * Access: Public
 */
exports.findRoutesByStops = async (req, res, next) => {
  try {
    const { stop, origin, destination } = req.query;
    console.log(origin, destination);

    let routes;

    if (origin && destination) {
      routes = await routeService.findRoutesBetweenStops(origin, destination);
    }

    if (stop) {
      routes = await routeService.findRoutesByStop(stop);
    }

    res.status(200).json(routes);
  } catch (error) {
    next(error);
  }
};
