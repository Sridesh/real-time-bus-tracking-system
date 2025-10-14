const express = require('express');
const operatorController = require('../../controllers/operator.controller');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Operators
 *   description: Operator management
 */

/**
 * @swagger
 * /operators:
 *   post:
 *     summary: Create a new operator
 *     tags: [Operators]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Operator'
 *     responses:
 *       201:
 *         description: Operator created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Operator'
 */
router.post('/', operatorController.createOperator);

/**
 * @swagger
 * /operators:
 *   get:
 *     summary: Get all operators
 *     tags: [Operators]
 *     responses:
 *       200:
 *         description: List of operators
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Operator'
 */
router.get('/', operatorController.getOperators);

/**
 * @swagger
 * /operators/province:
 *   get:
 *     summary: Get operators by province
 *     tags: [Operators]
 *     parameters:
 *       - in: query
 *         name: province
 *         required: true
 *         schema:
 *           type: string
 *         description: Province name
 *     responses:
 *       200:
 *         description: List of operators in the province
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Operator'
 *       404:
 *         description: No operators found in the province
 */
router.get('/province', operatorController.findByProvince);

/**
 * @swagger
 * /operators/{id}:
 *   get:
 *     summary: Get operator by ID
 *     tags: [Operators]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Operator ID
 *     responses:
 *       200:
 *         description: Operator found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Operator'
 *       404:
 *         description: Operator not found
 */
router.get('/:id', operatorController.getOperatorById);

/**
 * @swagger
 * /operators/{id}:
 *   put:
 *     summary: Update operator by ID
 *     tags: [Operators]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Operator ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Operator'
 *     responses:
 *       200:
 *         description: Operator updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Operator'
 *       404:
 *         description: Operator not found
 */
router.put('/:id', operatorController.updateOperator);

/**
 * @swagger
 * /operators/{id}:
 *   delete:
 *     summary: Delete operator by ID
 *     tags: [Operators]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Operator ID
 *     responses:
 *       204:
 *         description: Operator deleted
 *       404:
 *         description: Operator not found
 */
router.delete('/:id', operatorController.deleteOperator);

/**
 * @swagger
 * /operators/user/{userId}:
 *   get:
 *     summary: Get operator by user ID
 *     tags: [Operators]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Operator found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Operator'
 *       404:
 *         description: Operator not found
 */
router.get('/user/:userId', operatorController.getOperatorByUserId);

module.exports = router;
