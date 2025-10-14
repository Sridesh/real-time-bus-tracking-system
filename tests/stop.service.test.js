const StopService = require('../src/services/stop.service');
const ApiError = require('../src/utils/ApiError');

jest.mock('../src/models/stop.model', () => ({
  Stop: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

const { Stop } = require('../src/models/stop.model');

//TODO - fix this
describe('StopService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return stop if data is valid', async () => {
      Stop.create.mockResolvedValue({
        name: 'Random Bus Stop',
        city: 'Colombo 0100',
        latitude: 6.932721600686399,
        longitude: 79.86058304725408,
      });
      const result = await StopService.create({
        name: 'Random Bus Stop',
        city: 'Colombo 0100',
        latitude: 6.932721600686399,
        longitude: 79.86058304725408,
      });
      expect(result.name).toBe('Random Bus Stop');
    });

    it('should throw ApiError if required fields are missing', async () => {
      await expect(StopService.create({ name: 'Stop2' })).rejects.toThrow(ApiError);
    });
  });

  describe('findById', () => {
    it('should return stop if found', async () => {
      Stop.findById.mockResolvedValue({
        name: 'Stop3',
        city: 'City3',
        location: { coordinates: [80, 7] },
      });
      const result = await StopService.findById('68edc5042b911b630eae00b5');
      expect(result.name).toBe('Stop3');
    });

    it('should throw ApiError if stop not found', async () => {
      Stop.findById.mockResolvedValue(null);
      await expect(StopService.findById('68edc5042b911b630eae00b5')).rejects.toThrow(ApiError);
    });
  });

  describe('delete', () => {
    it('should delete and return confirmation if stop exists', async () => {
      Stop.findByIdAndDelete.mockResolvedValue({ _id: '68edc5042b911b630eae00b5' });
      const result = await StopService.delete('68edc5042b911b630eae00b5');
      expect(result.message).toBe('Stop deleted successfully');
    });

    it('should throw ApiError if stop not found', async () => {
      Stop.findByIdAndDelete.mockResolvedValue(null);
      await expect(StopService.delete('68edc5042b911b630eae00b5')).rejects.toThrow(ApiError);
    });
  });
});
