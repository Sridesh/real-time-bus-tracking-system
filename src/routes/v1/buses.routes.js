const express = require('express');
const requireRoles = require('../../middleware/rbac.middleware');
const authenticate = require('../../middleware/authenticate.middleware');
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
 *     responses:
 *       200:
 *         description: A list of buses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.get('/', (req, res) => {
  res.send({
    message: ['Helloooooo'],
  });
});

module.exports = router;
