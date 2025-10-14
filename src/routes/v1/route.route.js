const express = require('express');
const router = express.Router();
const routeController = require('../../controllers/route.controller');
// const validate = require('../middlewares/validate');
// const { createRouteValidator, updateRouteValidator } = require('./route.validators');

/**
 * @swagger
 * tags:
 *   name: Routes
 *   description: API endpoints for managing bus routes
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Stop:
 *       type: object
 *       required:
 *         - name
 *         - location
 *       properties:
 *         name:
 *           type: string
 *           example: "Main Street Station"
 *         location:
 *           type: array
 *           items:
 *             type: number
 *           description: [longitude, latitude]
 *           example: [79.8612, 6.9271]
 *
 *     Route:
 *       type: object
 *       required:
 *         - name
 *         - routeNumber
 *         - origin
 *         - destination
 *         - distance
 *         - estimatedDuration
 *       properties:
 *         name:
 *           type: string
 *           example: "Colombo - Kandy"
 *         routeNumber:
 *           type: string
 *           example: "01-001"
 *         origin:
 *           type: string
 *           example: "Colombo"
 *         destination:
 *           type: string
 *           example: "Kandy"
 *         distance:
 *           type: number
 *           example: 115.5
 *         estimatedDuration:
 *           type: number
 *           example: 180
 *         operatingDays:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
 *         startTime:
 *           type: string
 *           example: "06:00"
 *         endTime:
 *           type: string
 *           example: "21:00"
 *         frequency:
 *           type: number
 *           example: 30
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended]
 *           example: "active"
 *         stops:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Stop'
 *         totalStops:
 *           type: number
 *           example: 15
 *         averageSpeed:
 *           type: number
 *           example: 38.5
 *         mode:
 *           type: string
 *           enum: [Non-Express, Express, Highway]
 */

/**
 * @swagger
 * /routes:
 *   get:
 *     summary: Get all routes with optional filters and pagination
 *     tags: [Routes]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended]
 *         description: Filter by route status
 *       - in: query
 *         name: origin
 *         schema:
 *           type: string
 *         description: Filter by origin city
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *         description: Filter by destination city
 *       - in: query
 *         name: minDistance
 *         schema:
 *           type: number
 *         description: Minimum route distance
 *       - in: query
 *         name: maxDistance
 *         schema:
 *           type: number
 *         description: Maximum route distance
 *       - in: query
 *         name: operatingDay
 *         schema:
 *           type: string
 *         description: Filter by operating day (e.g., Monday)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           example: routeNumber
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: List of routes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 routes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Route'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     total:
 *                       type: number
 *                     totalPages:
 *                       type: number
 */
router.get('/', routeController.getAllRoutes);

/**
 * @swagger
 * /routes/{id}:
 *   get:
 *     summary: Get a route by ID
 *     tags: [Routes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Route ID
 *     responses:
 *       200:
 *         description: Route details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Route'
 *       404:
 *         description: Route not found
 */
router.get('/:id', routeController.getRouteById);

/**
 * @swagger
 * /routes/{id}/buses:
 *   get:
 *     summary: Get all buses assigned to a specific route
 *     tags: [Routes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Route ID
 *     responses:
 *       200:
 *         description: List of buses on the route
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "6717d0fa34b2b3f2a6e0b112"
 *                   plateNumber:
 *                     type: string
 *                     example: "NA-4523"
 *                   capacity:
 *                     type: integer
 *                     example: 45
 *                   status:
 *                     type: string
 *                     enum: [active, maintenance, inactive]
 *                     example: "active"
 *       404:
 *         description: Route not found
 */
router.get('/:id/buses', routeController.getBusesOnRoute);

/**
 * @swagger
 * /routes:
 *   post:
 *     summary: Create a new route
 *     tags: [Routes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Route'
 *     responses:
 *       201:
 *         description: Route created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Route'
 *       400:
 *         description: Invalid input data
 */
router.post('/', routeController.createRoute);

/**
 * @swagger
 * /routes/{id}:
 *   put:
 *     summary: Update an existing route
 *     tags: [Routes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Route ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Route'
 *     responses:
 *       200:
 *         description: Route updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Route'
 *       404:
 *         description: Route not found
 */
router.put('/:id', routeController.updateRoute);

/**
 * @swagger
 * /routes/{id}:
 *   delete:
 *     summary: Delete a route by ID
 *     tags: [Routes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Route ID
 *     responses:
 *       200:
 *         description: Route deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Route deleted successfully
 *       404:
 *         description: Route not found
 */
router.delete('/:id', routeController.deleteRoute);

module.exports = router;
