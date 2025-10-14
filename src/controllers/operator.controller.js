const operatorService = require('../services/operator.service');

// Create a new operator
exports.createOperator = async (req, res, next) => {
  try {
    const operator = await operatorService.createOperator(req.body);
    res.status(201).json(operator);
  } catch (err) {
    next(err);
  }
};

// Get all operators
exports.getOperators = async (req, res, next) => {
  try {
    const operators = await operatorService.getOperators();
    res.json(operators);
  } catch (err) {
    next(err);
  }
};

// Get operator by ID
exports.getOperatorById = async (req, res, next) => {
  try {
    const operator = await operatorService.getOperatorById(req.params.id);
    if (!operator) return res.status(404).json({ message: 'Operator not found' });
    res.json(operator);
  } catch (err) {
    next(err);
  }
};

// Get operator by User ID
exports.getOperatorByUserId = async (req, res, next) => {
  try {
    const operator = await operatorService.getOperatorByUserId(req.params.userId);
    if (!operator) return res.status(404).json({ message: 'Operator not found' });
    res.json(operator);
  } catch (err) {
    next(err);
  }
};

// Update operator
exports.updateOperator = async (req, res, next) => {
  try {
    const operator = await operatorService.updateOperator(req.params.id, req.body);
    if (!operator) return res.status(404).json({ message: 'Operator not found' });
    res.json(operator);
  } catch (err) {
    next(err);
  }
};

// Delete operator
exports.deleteOperator = async (req, res, next) => {
  try {
    const result = await operatorService.deleteOperator(req.params.id);
    if (!result) return res.status(404).json({ message: 'Operator not found or cannot delete' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

// Find operators by province
exports.findByProvince = async (req, res, next) => {
  try {
    const { province, status } = req.query;
    const operators = await operatorService.findByProvince(province, status);
    res.json(operators);
  } catch (err) {
    next(err);
  }
};
