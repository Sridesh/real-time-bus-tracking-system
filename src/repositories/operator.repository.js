const Operator = require('../models/operator.model');

class OperatorRepository {
  async create(data) {
    return Operator.create(data);
  }

  async findAll(filter = {}) {
    return Operator.find(filter);
  }

  async findById(id) {
    return Operator.findById(id);
  }

  async update(id, data) {
    return Operator.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    const operator = await Operator.findById(id);
    if (!operator) return null;
    await operator.remove();
    return operator;
  }

  async findByProvince(province, status = 'active') {
    return Operator.findByProvince(province, status);
  }

  async findByUserId(userId) {
    return Operator.findOne({ userId: userId });
  }
}

module.exports = new OperatorRepository();
