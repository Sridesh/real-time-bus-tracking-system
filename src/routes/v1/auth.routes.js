const express = require('express');
const authController = require('../../controllers/auth.controllers');

const router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Authentication
 *  description: API endpoints for handling authentication
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: User signup
 *     tags: [Authentication]
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  phone_number:
 *                      type: number
 *                      format: email
 *                  password:
 *                      type: string
 *                      format: password
 */
router.post('/signup', (req, res) => {
  console.log(req.body);

  res.send({
    message: ['Hello'],
  });
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: User logout
 *     tags: [Authentication]
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.post('/logout', authController.logout);

module.exports = router;
