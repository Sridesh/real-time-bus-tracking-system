const operatorRepository = require('../repositories/operator.repository');

class OperatorService {
  async createOperator(data) {
    return operatorRepository.create(data);
  }

  async getOperators(filter = {}) {
    return operatorRepository.findAll(filter);
  }

  async getOperatorById(id) {
    return operatorRepository.findById(id);
  }

  async updateOperator(id, data) {
    return operatorRepository.update(id, data);
  }

  async deleteOperator(id) {
    return operatorRepository.delete(id);
  }

  async findByProvince(province, status = 'active') {
    return operatorRepository.findByProvince(province, status);
  }

  async getOperatorByUserId(userId) {
    return operatorRepository.findByUserId(userId).populate('totalBuses').populate('activeBuses');
  }
}

module.exports = new OperatorService();
