const express = require('express');
const LocationController = require('../../controllers/location.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Location
 *   description: Bus location & ETA APIs
 */

/**
 * @swagger
 * /location:
 *   post:
 *     summary: Update location of a bus
 *     tags: [Location]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               busId:
 *                 type: string
 *                 example: "123"
 *               longitude:
 *                 type: number
 *                 example: 79.8612
 *               latitude:
 *                 type: number
 *                 example: 6.9271
 *     responses:
 *       200:
 *         description: Location updated successfully
 */
router.post('/', LocationController.updateLocation);

/**
 * @swagger
 * /location/buses-active:
 *   get:
 *     summary: Get all active bus locations
 *     tags: [Location]
 *     responses:
 *       200:
 *         description: List of all active bus locations
 */
router.get('/buses-active', LocationController.getAllActiveBusLocations);

/**
 * @swagger
 * /location/estimated-arrival:
 *   get:
 *     summary: Get estimated arrival time for a bus
 *     tags: [Location]
 *     parameters:
 *       - in: query
 *         name: busId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bus ID
 *       - in: query
 *         name: destLat
 *         required: true
 *         schema:
 *           type: number
 *         description: Destination latitude
 *       - in: query
 *         name: destLon
 *         required: true
 *         schema:
 *           type: number
 *         description: Destination longitude
 *     responses:
 *       200:
 *         description: Estimated arrival time
 */
router.get('/estimated-arrival', LocationController.getEstimatedTime);

/**
 * @swagger
 * /location/multiple-arrivals:
 *   post:
 *     summary: Get estimated arrival times for multiple buses
 *     tags: [Location]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               busIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["123", "456"]
 *               destLat:
 *                 type: number
 *                 example: 6.9271
 *               destLon:
 *                 type: number
 *                 example: 79.8612
 *     responses:
 *       200:
 *         description: Estimated arrival times for multiple buses
 */
router.post('/multiple-arrivals', LocationController.getMultipleEstimatedTime);

/**
 * @swagger
 * /location/{busId}:
 *   get:
 *     summary: Get current location of a bus
 *     tags: [Location]
 *     parameters:
 *       - in: path
 *         name: busId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bus ID
 *     responses:
 *       200:
 *         description: Current bus location
 */
router.get('/:busId', LocationController.getLocationByBus);

/**
 * @swagger
 * /location/buses-nearby:
 *   post:
 *     summary: Find nearby buses
 *     tags: [Location]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               latitude:
 *                 type: number
 *                 example: 6.9271
 *               longitude:
 *                 type: number
 *                 example: 79.8612
 *               radius:
 *                 type: number
 *                 example: 5
 *     responses:
 *       200:
 *         description: List of nearby buses
 */
router.post('/buses-nearby', LocationController.getNearbyBuses);

module.exports = router;
