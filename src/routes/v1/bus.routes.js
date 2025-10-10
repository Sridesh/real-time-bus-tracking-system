const express = require('express');
const requireRoles = require('../../middleware/rbac.middleware');
const authenticate = require('../../middleware/authenticate.middleware');
const busController = require('../../controllers/bus.controller');
const roles = require('../../utils/roles');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Buses
 *   description: API endpoint for bus data
 */

/**
 * @swagger
 * /buses:
 *   get:
 *     summary: Get all buses
 *     tags: [Buses]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of results per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, maintenance, out_of_service]
 *         description: Filter buses by status
 *       - in: query
 *         name: manufacturer
 *         schema:
 *           type: string
 *           enum: [Ashok Leyland, TATA, Rosa]
 *         description: Filter buses by manufacturer
 *       - in: query
 *         name: minCapacity
 *         schema:
 *           type: integer
 *         description: Minimum bus capacity
 *       - in: query
 *         name: maxCapacity
 *         schema:
 *           type: integer
 *         description: Maximum bus capacity
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search buses by registration number or model
 *     responses:
 *       200:
 *         description: List of buses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 buses:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       registrationNumber:
 *                         type: string
 *                       status:
 *                         type: string
 *                       capacity:
 *                         type: number
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
router.get('/', busController.getAllBuses);

/**
 * @swagger
 * /buses/{busId}:
 *   get:
 *     summary: Get all buses
 *     tags: [Buses]
 *     parameters:
 *       - in: query
 *         name: busId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bus object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 buses:
 *                   type: object
 *                   properties:
 *                     registrationNumber:
 *                       type: string
 *                     status:
 *                       type: string
 *                     capacity:
 *                       type: number
 */
router.get('/:busId', busController.getBusById);

/**
 * @swagger
 * /buses:
 *   post:
 *     summary: Create a new bus
 *     tags: [Buses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - registrationNumber
 *               - capacity
 *               - status
 *             properties:
 *               registrationNumber:
 *                 type: string
 *                 example: "WP-NA-1234"
 *               status:
 *                 type: string
 *                 enum: [active, inactive, maintenance, out_of_service]
 *                 example: active
 *               capacity:
 *                 type: integer
 *                 example: 54
 *               manufacturer:
 *                 type: string
 *                 example: "Ashok Leyland"
 *               model:
 *                 type: string
 *                 example: "Viking"
 *     responses:
 *       201:
 *         description: Bus created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 registrationNumber:
 *                   type: string
 *                 status:
 *                   type: string
 *                 capacity:
 *                   type: integer
 *                 manufacturer:
 *                   type: string
 *                 model:
 *                   type: string
 *       400:
 *         description: Invalid input data
 */
router.post('/', authenticate, requireRoles([roles.ADMIN]), busController.createBus);

/**
 * @swagger
 * /buses:
 *   put:
 *     summary: Update an existing bus
 *     tags: [Buses]
 *     parameters:
 *       - in: query
 *         name: busId
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - registrationNumber
 *               - capacity
 *               - status
 *             properties:
 *               registrationNumber:
 *                 type: string
 *                 example: "WP-NA-1234"
 *               status:
 *                 type: string
 *                 enum: [active, inactive, maintenance, out_of_service]
 *                 example: active
 *               capacity:
 *                 type: integer
 *                 example: 54
 *               manufacturer:
 *                 type: string
 *                 example: "Ashok Leyland"
 *               model:
 *                 type: string
 *                 example: "Viking"
 *     responses:
 *       201:
 *         description: Bus created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 registrationNumber:
 *                   type: string
 *                 status:
 *                   type: string
 *                 capacity:
 *                   type: integer
 *                 manufacturer:
 *                   type: string
 *                 model:
 *                   type: string
 *       400:
 *         description: Invalid input data
 */
router.put(
  '/:busId',
  authenticate,
  requireRoles([roles.ADMIN, roles.OPERATOR]),
  busController.updateBus
);

/**
 * @swagger
 * /buses/{busId}:
 *   delete:
 *     summary: Delete a bus
 *     tags: [Buses]
 *     description: Delete a bus by its ID (Admin only)
 *     parameters:
 *       - in: path
 *         name: busId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the bus to delete
 *     responses:
 *       204:
 *         description: Bus deleted successfully (No Content)
 *       400:
 *         description: Invalid bus ID format
 *       403:
 *         description: Insufficient permission
 *       404:
 *         description: Bus not found
 */
router.delete(
  '/:busId',
  authenticate,
  requireRoles([roles.ADMIN, roles.OPERATOR]),
  busController.deleteBus
);

module.exports = router;
