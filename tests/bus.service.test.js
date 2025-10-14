const BusService = require('../src/services/bus.service');
const ApiError = require('../src/utils/ApiError');

jest.mock('../src/repositories/bus.repository.js', () => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByRegistration: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}));

const busRepository = require('../src/repositories/bus.repository.js');

describe('BusService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBusById', () => {
    it('should return transformed bus data if found', async () => {
      const bus = {
        _id: 'id1',
        registrationNumber: 'reg1',
        capacity: 50,
        status: 'active',
        updatedAt: new Date(),
      };
      busRepository.findById.mockResolvedValue(bus);

      const result = await BusService.getBusById('68edc5042b911b630eae00b5');
      expect(result.registrationNumber).toBe('reg1');
    });

    it('should throw ApiError if bus not found', async () => {
      busRepository.findById.mockResolvedValue(null);
      await expect(BusService.getBusById('68edc5042b911b630eae00b5')).rejects.toThrow(ApiError);
    });
  });

  describe('createBus', () => {
    it('should create and return bus if registration is unique', async () => {
      busRepository.findByRegistration.mockResolvedValue(null);
      busRepository.create.mockResolvedValue({
        _id: '68edc5042b911b630eae00b5',
        registrationNumber: 'reg3',
        capacity: 40,
        status: 'active',
      });

      const result = await BusService.createBus({
        registrationNumber: 'reg3',
        capacity: 40,
        status: 'active',
      });
      expect(result.registrationNumber).toBe('reg3');
    });

    it('should throw ApiError if registration number exists', async () => {
      busRepository.findByRegistration.mockResolvedValue({ _id: '68edc5042b911b630eae00b5' });
      await expect(BusService.createBus({ registrationNumber: 'reg4' })).rejects.toThrow(ApiError);
    });
  });

  describe('deleteBus', () => {
    it('should throw ApiError if user is not admin', async () => {
      busRepository.findById.mockResolvedValue({ _id: '68edc5042b911b630eae00b5' });
      await expect(
        BusService.deleteBus('68edc5042b911b630eae00b5', { role: 'commuter' })
      ).rejects.toThrow(ApiError);
    });

    it('should delete bus if user is admin', async () => {
      busRepository.findById.mockResolvedValue({ _id: '68edc5042b911b630eae00b5' });
      busRepository.delete.mockResolvedValue({ _id: '68edc5042b911b630eae00b5' });
      await expect(
        BusService.deleteBus('68edc5042b911b630eae00b5', { role: 'admin' })
      ).resolves.toBeUndefined();
    });
  });
});
