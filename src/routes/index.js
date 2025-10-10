const express = require('express');
const busesRoutes = require('./v1/bus.routes');
const authRoutes = require('./v1/auth.routes');
const locationRoutes = require('./v1/location.route');

const router = express.Router();

router.use('/v1/buses', busesRoutes);
router.use('/v1/auth', authRoutes);
router.use('/v1/location', locationRoutes);

module.exports = router;
