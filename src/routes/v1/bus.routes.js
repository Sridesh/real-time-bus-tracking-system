const express = require('express');
const requireRoles = require('../../middleware/rbac.middleware');
const authenticate = require('../../middleware/authenticate.middleware');
const busController = require('../../controllers/bus.controller');

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

module.exports = router;
