const express = require('express');
const busesRoutes = require('./v1/buses.routes');
const authRoutes = require('./v1/auth.routes');

const router = express.Router();

router.use('/v1/buses', busesRoutes);
router.use('/v1/auth', authRoutes);

module.exports = router;
