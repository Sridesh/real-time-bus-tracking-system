const express = require('express');
const busesRoutes = require('./v1/bus.routes');
const authRoutes = require('./v1/auth.routes');
const locationRoutes = require('./v1/location.route');
const routeRoutes = require('./v1/route.route');
const stopRoutes = require('./v1/stop.route');
const operatorRoute = require('./v1/operator.route');
const healthRoute = require('./v1/health.route');

const router = express.Router();

router.use('/v1/buses', busesRoutes);
router.use('/v1/auth', authRoutes);
router.use('/v1/location', locationRoutes);
router.use('/v1/routes', routeRoutes);
router.use('/v1/stops', stopRoutes);
router.use('/v1/operators', operatorRoute);
router.use('/v1/health', healthRoute);

module.exports = router;
