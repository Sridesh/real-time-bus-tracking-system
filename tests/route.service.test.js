const RouteService = require('../src/services/route.service');
const ApiError = require('../src/utils/ApiError');

jest.mock('../src/repositories/route.repository', () => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByRouteNumber: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getBusesOnRoute: jest.fn(),
  count: jest.fn(),
}));

const routeRepository = require('../src/repositories/route.repository');

describe('RouteService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRouteById', () => {
    it('should return transformed route data if found', async () => {
      const route = {
        _id: '68edc5042b911b630eae00b5',
        name: 'Route1',
        routeNumber: 'RN1',
        stops: [],
        updatedAt: new Date(),
      };
      routeRepository.findById.mockResolvedValue(route);

      const result = await RouteService.getRouteById('68edc5042b911b630eae00b5');
      expect(result.name).toBe('Route1');
    });

    it('should throw ApiError if route not found', async () => {
      routeRepository.findById.mockResolvedValue(null);
      await expect(RouteService.getRouteById('r2')).rejects.toThrow(ApiError);
    });
  });

  describe('createRoute', () => {
    it('should create and return route if route number is unique', async () => {
      routeRepository.findByRouteNumber.mockResolvedValue(null);
      routeRepository.create.mockResolvedValue({
        _id: 'r3',
        name: 'Route3',
        routeNumber: 'RN3',
        stops: [],
      });

      const result = await RouteService.createRoute({ name: 'Route3', routeNumber: 'RN3' });
      expect(result.routeNumber).toBe('RN3');
    });

    it('should throw ApiError if route number exists', async () => {
      routeRepository.findByRouteNumber.mockResolvedValue({ _id: 'r4' });
      await expect(RouteService.createRoute({ routeNumber: 'RN4' })).rejects.toThrow(ApiError);
    });
  });

  describe('deleteRoute', () => {
    it('should throw ApiError if route has buses', async () => {
      routeRepository.findById.mockResolvedValue({ _id: '68edc5042b911b630eae00b5' });
      routeRepository.getBusesOnRoute.mockResolvedValue([{ _id: '68edc5042b911b630eae00b5' }]);
      await expect(RouteService.deleteRoute('r5')).rejects.toThrow(ApiError);
    });

    it('should delete route if no buses', async () => {
      routeRepository.findById.mockResolvedValue({ _id: '68edc5042b911b630eae00b5' });
      routeRepository.getBusesOnRoute.mockResolvedValue([]);
      routeRepository.delete.mockResolvedValue({ _id: '68edc5042b911b630eae00b5' });
      await expect(RouteService.deleteRoute('68edc5042b911b630eae00b5')).resolves.toBeUndefined();
    });
  });
});
