const express = require('express');
const router = express.Router();
const routeController = require('../../controllers/route.controller');
// const validate = require('../middlewares/validate');
// const { createRouteValidator, updateRouteValidator } = require('./route.validators');

// GET all routes (with query filters)
router.get('/', routeController.getAllRoutes);

// GET one route
router.get('/:id', routeController.getRouteById);

// GET buses assigned to a route
router.get('/:id/buses', routeController.getBusesOnRoute);

// CREATE
router.post('/', routeController.createRoute);

// UPDATE
router.put('/:id', routeController.updateRoute);

// DELETE
router.delete('/:id', routeController.deleteRoute);

module.exports = router;
