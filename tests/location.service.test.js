const LocationService = require('../src/services/location.service');
const locationRepository = require('../src/repositories/location.repository');
const busRepository = require('../src/repositories/bus.repository');
const ApiError = require('../src/utils/ApiError');

jest.mock('../src/repositories/location.repository');
jest.mock('../src/repositories/bus.repository');

const busId = '68edc5042b911b630eae00b5';

describe('LocationService', () => {
  afterEach(() => jest.clearAllMocks());

  describe('updateLocation', () => {
    it('should throw error if bus not found', async () => {
      busRepository.findById.mockResolvedValue(null);
      await expect(LocationService.updateLocation({ busId }, {})).rejects.toThrow(ApiError);
    });

    it('should throw error if location is outside Sri Lanka', async () => {
      busRepository.findById.mockResolvedValue({ _id: busId });
      await expect(
        LocationService.updateLocation({ busId, latitude: 0, longitude: 0 }, {})
      ).rejects.toThrow(ApiError);
    });

    it('should create location if valid', async () => {
      busRepository.findById.mockResolvedValue({ _id: busId });
      locationRepository.create.mockResolvedValue({ _id: busId, latitude: 6.9, longitude: 79.8 });
      const result = await LocationService.updateLocation(
        { busId, latitude: 6.9, longitude: 79.8 },
        {}
      );
      expect(result.latitude).toBe(6.9);
    });
  });

  describe('getCurrentLocation', () => {
    it('should throw error if bus not found', async () => {
      busRepository.findById.mockResolvedValue(null);
      await expect(LocationService.getCurrentLocation(busId)).rejects.toThrow(ApiError);
    });

    it('should throw error if no location', async () => {
      busRepository.findById.mockResolvedValue({ _id: busId });
      locationRepository.getLatestByBusId.mockResolvedValue(null);
      await expect(LocationService.getCurrentLocation(busId)).rejects.toThrow(ApiError);
    });

    it('should return location if found', async () => {
      busRepository.findById.mockResolvedValue({ _id: busId });
      locationRepository.getLatestByBusId.mockResolvedValue({
        _id: busId,
        latitude: 6.9,
        longitude: 79.8,
        timestamp: new Date(),
        speed: 50,
        isMoving: true,
      });
      const result = await LocationService.getCurrentLocation(busId);
      expect(result.latitude).toBe(6.9);
    });
  });

  describe('findNearbyBuses', () => {
    it('should throw error for invalid coordinates', async () => {
      await expect(LocationService.findNearbyBuses(200, 6.9, 5)).rejects.toThrow(ApiError);
      await expect(LocationService.findNearbyBuses(79.8, -100, 5)).rejects.toThrow(ApiError);
    });

    it('should return nearby buses', async () => {
      locationRepository.findNearby.mockResolvedValue([
        {
          bus: { _id: busId, registrationNumber: 'WP-NA-1234', capacity: 50, status: 'active' },
          latitude: 6.9,
          longitude: 79.8,
          timestamp: new Date(),
          speed: 40,
          heading: 90,
          isMoving: true,
          distance: 1000,
        },
      ]);
      const result = await LocationService.findNearbyBuses(79.8, 6.9, 5);
      expect(result[0].bus.registrationNumber).toBe('WP-NA-1234');
    });
  });

  describe('estimateArrivalTime', () => {
    it('should throw error if no location', async () => {
      locationRepository.getLatestByBusId.mockResolvedValue(null);
      await expect(LocationService.estimateArrivalTime(busId, 6.9, 79.8)).rejects.toThrow(ApiError);
    });

    it('should return null estimatedTime if bus not moving', async () => {
      locationRepository.getLatestByBusId.mockResolvedValue({
        latitude: 6.9,
        longitude: 79.8,
        speed: 0,
        isMoving: false,
        timestamp: new Date(),
      });
      const result = await LocationService.estimateArrivalTime(busId, 7, 80);
      expect(result.estimatedTime).toBeNull();
    });

    it('should return estimatedTime if bus is moving', async () => {
      locationRepository.getLatestByBusId.mockResolvedValue({
        latitude: 6.9,
        longitude: 79.8,
        speed: 50,
        isMoving: true,
        timestamp: new Date(),
      });
      const result = await LocationService.estimateArrivalTime(busId, 7, 80);
      expect(result.estimatedTime).not.toBeNull();
    });
  });
});
