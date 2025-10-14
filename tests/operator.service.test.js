const OperatorService = require('../src/services/operator.service');
const operatorRepository = require('../src/repositories/operator.repository');

jest.mock('../src/repositories/operator.repository');

const operatorId = '68edc5042b911b630eae00b5';

describe('OperatorService', () => {
  afterEach(() => jest.clearAllMocks());

  it('should create an operator', async () => {
    operatorRepository.create.mockResolvedValue({ _id: operatorId, name: 'Test Operator' });
    const result = await OperatorService.createOperator({ name: 'Test Operator' });
    expect(result._id).toBe(operatorId);
  });

  it('should get all operators', async () => {
    operatorRepository.findAll.mockResolvedValue([{ _id: operatorId, name: 'Test Operator' }]);
    const result = await OperatorService.getOperators();
    expect(result[0]._id).toBe(operatorId);
  });

  it('should get operator by id', async () => {
    operatorRepository.findById.mockResolvedValue({ _id: operatorId, name: 'Test Operator' });
    const result = await OperatorService.getOperatorById(operatorId);
    expect(result._id).toBe(operatorId);
  });

  it('should update operator', async () => {
    operatorRepository.update.mockResolvedValue({ _id: operatorId, name: 'Updated Operator' });
    const result = await OperatorService.updateOperator(operatorId, { name: 'Updated Operator' });
    expect(result.name).toBe('Updated Operator');
  });

  it('should delete operator', async () => {
    operatorRepository.delete.mockResolvedValue({ _id: operatorId });
    const result = await OperatorService.deleteOperator(operatorId);
    expect(result._id).toBe(operatorId);
  });

  it('should find by province', async () => {
    operatorRepository.findByProvince.mockResolvedValue([{ _id: operatorId, province: 'Western' }]);
    const result = await OperatorService.findByProvince('Western');
    expect(result[0].province).toBe('Western');
  });

  it('should get operator by userId', async () => {
    operatorRepository.findByUserId.mockResolvedValue({ _id: operatorId, userId: operatorId });
    const result = await OperatorService.getOperatorByUserId(operatorId);
    expect(result.userId).toBe(operatorId);
  });
});
