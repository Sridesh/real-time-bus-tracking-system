const express = require('express');
const stopController = require('../../controllers/stop.controller');
const authenticate = require('../../middleware/authenticate.middleware');
const requireRoles = require('../../middleware/rbac.middleware');
const roles = require('../../utils/roles');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Stops
 *   description: API endpoints for managing bus stops
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Stop:
 *       type: object
 *       required:
 *         - name
 *         - city
 *         - latitude
 *         - longitude
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the stop
 *           example: 652a1b2f9f4f4e2b3c7c1234
 *         name:
 *           type: string
 *           example: Morawatta Bus Stop
 *         City:
 *           type: string
 *           example: Kandana
 *         latitude:
 *           type: number
 *           example: 6.9271
 *         longitude:
 *           type: number
 *           example: 79.8612
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2025-10-10T14:48:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2025-10-10T14:48:00.000Z
 */

/**
 * @swagger
 * /stops:
 *   get:
 *     summary: Get all stops (with optional search filter)
 *     tags: [Stops]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search stops by name (case-insensitive)
 *     responses:
 *       200:
 *         description: List of all stops
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Stop'
 *       500:
 *         description: Server error
 */
router.get('/', stopController.getAll);

/**
 * @swagger
 * /stops/nearby:
 *   get:
 *     summary: Find nearby stops within a radius
 *     tags: [Stops]
 *     parameters:
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         required: true
 *         description: Latitude of the location
 *         example: 6.9271
 *       - in: query
 *         name: lon
 *         schema:
 *           type: number
 *         required: true
 *         description: Longitude of the location
 *         example: 79.8612
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         required: false
 *         description: Search radius in meters (default 1000m)
 *         example: 1000
 *     responses:
 *       200:
 *         description: List of nearby stops
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Stop'
 *       400:
 *         description: Invalid latitude or longitude
 *       500:
 *         description: Server error
 */
router.get('/nearby', authenticate, stopController.findNearby);

/**
 * @swagger
 * /stops/{stopId}:
 *   get:
 *     summary: Get stop details by ID
 *     tags: [Stops]
 *     parameters:
 *       - in: path
 *         name: stopId
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique ID of the stop
 *     responses:
 *       200:
 *         description: Stop details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stop'
 *       404:
 *         description: Stop not found
 *       500:
 *         description: Server error
 */
router.get('/:stopId', stopController.getById);

/**
 * @swagger
 * /stops:
 *   post:
 *     summary: Create a new stop
 *     tags: [Stops]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - city
 *               - latitude
 *               - longitude
 *             properties:
 *               name:
 *                 type: string
 *                 example: Morawatta Bus Stop
 *               city:
 *                 type: string
 *                 example: Kandana
 *               latitude:
 *                 type: number
 *                 example: 6.9271
 *               longitude:
 *                 type: number
 *                 example: 79.8612
 *     responses:
 *       201:
 *         description: Stop created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stop'
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.post('/', authenticate, requireRoles([roles.ADMIN]), stopController.create);

/**
 * @swagger
 * /stops/{stopId}:
 *   delete:
 *     summary: Delete a stop by ID
 *     tags: [Stops]
 *     parameters:
 *       - in: path
 *         name: stopId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the stop to delete
 *     responses:
 *       204:
 *         description: Stop deleted successfully (no content)
 *       404:
 *         description: Stop not found
 *       500:
 *         description: Server error
 */
router.delete('/:stopId', authenticate, requireRoles([roles.ADMIN]), stopController.delete);

/**
 * @swagger
 * /stops/{stopId}:
 *   put:
 *     summary: Update an existing stop
 *     tags: [Stops]
 *     parameters:
 *       - in: path
 *         name: stopId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the stop to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Stop Name
 *               latitude:
 *                 type: number
 *                 example: 6.935
 *               longitude:
 *                 type: number
 *                 example: 79.850
 *     responses:
 *       200:
 *         description: Stop updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stop'
 *       404:
 *         description: Stop not found
 *       400:
 *         description: Invalid update data
 *       500:
 *         description: Server error
 */
router.put('/:stopId', authenticate, requireRoles([roles.ADMIN]), stopController.update);

module.exports = router;
