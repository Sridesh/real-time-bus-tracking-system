const { isValidObjectId } = require('mongoose');

const locationRepository = require('../repositories/location.repository');
const busRepository = require('../repositories/bus.repository');
const ApiError = require('../utils/ApiError');

/**
 * Location Service - GPS tracking business logic
 */
class LocationService {
  /**
   * Update bus location (create new location record)
   * @param {Object} locationData - Location data
   * @param {Object} user - Authenticated user
   * @returns {Promise<Object>} Created location
   */
  async updateLocation(locationData, user) {
    const { busId } = locationData;

    // Validate bus exists
    const bus = await busRepository.findById(busId);
    if (!bus) {
      throw new ApiError(404, 'Bus not found');
    }

    // if (bus.operatorId._id.toString() !== user.operatorId) {
    //   throw new ApiError(403, 'You can only update locations for your own buses');
    // }

    // Validate coordinates are in Sri Lanka
    if (!this.isInSriLanka(locationData.latitude, locationData.longitude)) {
      throw new ApiError(400, 'Location coordinates are outside Sri Lanka.');
    }

    // Create location record
    const location = await locationRepository.create({
      ...locationData,
      //   routeId: bus.routeId || locationData.routeId || null,
    });

    return this.transformLocationData(location);
  }

  /**
   * Get current location of a bus
   * @param {string} busId - Bus ID
   * @returns {Promise<Object>} Latest location
   */
  async getCurrentLocation(busId) {
    if (!isValidObjectId(busId)) {
      throw new ApiError(400, 'Invalid bus ID format');
    }

    // Check if bus exists
    const bus = await busRepository.findById(busId);

    if (!bus) {
      throw new ApiError(404, 'Bus not found');
    }

    // Get latest location
    const location = await locationRepository.getLatestByBusId(busId);

    if (!location) {
      throw new ApiError(404, 'No location data available for this bus');
    }

    // Check if location is stale (older than 30 minutes)
    const isStale = this.isLocationStale(location.timestamp, 30);

    return {
      ...this.transformLocationData(location),
      isStale,
      lastUpdated: this.getTimeAgo(location.timestamp),
    };
  }

  /**
   * Get location history for a bus
   * @param {string} busId - Bus ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Location history with pagination
   */
  // async getLocationHistory(busId, options = {}) {
  //   // Validate ObjectId
  //   if (!isValidObjectId(busId)) {
  //     throw new ApiError(400, 'Invalid bus ID format');
  //   }

  //   // Check if bus exists
  //   const bus = await busRepository.findById(busId);
  //   if (!bus) {
  //     throw new ApiError(404, 'Bus not found');
  //   }

  //   // Set default date range (last 24 hours if not specified)
  //   const defaultStartDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
  //   const queryOptions = {
  //     startDate: options.startDate || defaultStartDate,
  //     endDate: options.endDate || new Date(),
  //     page: options.page || 1,
  //     limit: options.limit || 100,
  //   };

  //   // Get locations and count
  //   const [locations, total] = await Promise.all([
  //     locationRepository.getHistoryByBusId(busId, queryOptions),
  //     locationRepository.countHistoryByBusId(busId, queryOptions),
  //   ]);

  //   // Calculate stats
  //   const stats = this.calculateLocationStats(locations);

  //   return {
  //     bus: {
  //       id: bus._id.toString(),
  //       registrationNumber: bus.registrationNumber,
  //     },
  //     locations: locations.map((loc) => this.transformLocationData(loc)),
  //     stats,
  //     pagination: {
  //       page: parseInt(queryOptions.page),
  //       limit: parseInt(queryOptions.limit),
  //       total,
  //       totalPages: Math.ceil(total / queryOptions.limit),
  //     },
  //   };
  // }

  /**
   * Find nearby buses
   * @param {number} longitude - Center longitude
   * @param {number} latitude - Center latitude
   * @param {number} radius - Search radius in km
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} Nearby buses
   */
  async findNearbyBuses(longitude, latitude, radius = 5, options = {}) {
    // Validate coordinates
    if (longitude < -180 || longitude > 180) {
      throw new ApiError(400, 'Invalid longitude');
    }
    if (latitude < -90 || latitude > 90) {
      throw new ApiError(400, 'Invalid latitude');
    }

    // Get nearby locations
    const results = await locationRepository.findNearby(longitude, latitude, radius, options);

    // Transform results
    return results.map((result) => ({
      bus: {
        id: result.bus._id.toString(),
        registrationNumber: result.bus.registrationNumber,
        capacity: result.bus.capacity,
        status: result.bus.status,
        model: result.bus.model,
        features: result.bus.features,
      },
      route: result.route
        ? {
            id: result.route._id.toString(),
            name: result.route.name,
            routeNumber: result.route.routeNumber,
            origin: result.route.origin,
            destination: result.route.destination,
          }
        : null,
      location: {
        latitude: result.latitude,
        longitude: result.longitude,
        speed: result.speed,
        heading: result.heading,
        headingDirection: this.getHeadingDirection(result.heading),
        timestamp: result.timestamp,
        isMoving: result.isMoving,
      },
      distance: Math.round(result.distance) / 1000, // Convert to km
      lastUpdated: this.getTimeAgo(result.timestamp),
    }));
  }

  /**
   * Get all active bus locations (live map)
   * @returns {Promise<Array>} All active bus locations
   */
  async getAllActiveBusLocations() {
    const locations = await locationRepository.getLatestForAllBuses();

    return locations.map((loc) => ({
      bus: {
        id: loc.bus._id.toString(),
        registrationNumber: loc.bus.registrationNumber,
        capacity: loc.bus.capacity,
        model: loc.bus.model,
      },
      location: {
        latitude: loc.latitude,
        longitude: loc.longitude,
        speed: loc.speed,
        heading: loc.heading,
        timestamp: loc.timestamp,
        isMoving: loc.isMoving,
      },
      lastUpdated: this.getTimeAgo(loc.timestamp),
      isStale: this.isLocationStale(loc.timestamp, 10),
    }));
  }

  /**
   * Calculate location statistics
   * @param {Array} locations - Array of location records
   * @returns {Object} Statistics
   */
  calculateLocationStats(locations) {
    if (locations.length === 0) {
      return {
        totalPoints: 0,
        totalDistance: 0,
        averageSpeed: 0,
        maxSpeed: 0,
        duration: 0,
      };
    }

    let totalDistance = 0;
    let totalSpeed = 0;
    let maxSpeed = 0;
    let movingCount = 0;

    for (let i = 1; i < locations.length; i++) {
      const prev = locations[i - 1];
      const curr = locations[i];

      // Calculate distance between points
      const distance = this.calculateDistance(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude
      );
      totalDistance += distance;

      // Track speeds
      if (curr.isMoving) {
        totalSpeed += curr.speed;
        movingCount++;
      }
      if (curr.speed > maxSpeed) {
        maxSpeed = curr.speed;
      }
    }

    // Calculate duration
    const firstTimestamp = new Date(locations[0].timestamp);
    const lastTimestamp = new Date(locations[locations.length - 1].timestamp);
    const durationMs = lastTimestamp - firstTimestamp;
    const durationMinutes = Math.round(durationMs / 60000);

    return {
      totalPoints: locations.length,
      totalDistance: Math.round(totalDistance * 100) / 100,
      averageSpeed: movingCount > 0 ? Math.round((totalSpeed / movingCount) * 10) / 10 : 0,
      maxSpeed: Math.round(maxSpeed * 10) / 10,
      duration: durationMinutes,
    };
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   * @param {number} lat1 - Latitude 1
   * @param {number} lon1 - Longitude 1
   * @param {number} lat2 - Latitude 2
   * @param {number} lon2 - Longitude 2
   * @returns {number} Distance in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Estimate time for a bus to reach a destination
   * @param {string} busId - Bus ID
   * @param {number} destLat - Destination latitude
   * @param {number} destLon - Destination longitude
   * @returns {Promise<Object>} Estimated time in minutes and distance
   */
  async estimateArrivalTime(busId, destLat, destLon) {
    // Get current bus location
    const location = await locationRepository.getLatestByBusId(busId);
    if (!location) {
      throw new ApiError(404, 'No location data available for this bus');
    }

    //Calculate distance from bus to destination
    const distanceKm = this.calculateDistance(
      location.latitude,
      location.longitude,
      destLat,
      destLon
    );

    if (!location.isMoving || location.speed <= 0) {
      return {
        distanceKm: Math.round(distanceKm * 100) / 100,
        estimatedTime: null,
        message: 'Bus is currently not moving, cannot estimate arrival time',
      };
    }

    // Estimate travel time
    const timeHours = distanceKm / location.speed;
    const timeMinutes = Math.round(timeHours * 60);

    return {
      distanceKm: Math.round(distanceKm * 100) / 100,
      estimatedTime: timeMinutes,
      lastUpdated: this.getTimeAgo(location.timestamp),
    };
  }

  /**
   * Estimate arrival time for multiple buses to a location
   * @param {Array<string>} busIds - List of bus IDs
   * @param {number} destLat - Destination latitude
   * @param {number} destLon - Destination longitude
   * @returns {Promise<Array>} Array of bus arrival estimates
   */
  async estimateArrivalTimesForBuses(busIds, destLat, destLon) {
    const results = [];

    for (const busId of busIds) {
      try {
        const estimate = await this.estimateArrivalTime(busId, destLat, destLon);
        results.push({
          busId,
          ...estimate,
        });
      } catch (error) {
        results.push({
          busId,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Check if location is in Sri Lanka (rough bounding box)
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {boolean} True if in Sri Lanka
   */
  isInSriLanka(latitude, longitude) {
    // Sri Lanka approximate bounding box
    const bounds = {
      minLat: 5.9,
      maxLat: 9.9,
      minLon: 79.5,
      maxLon: 82.0,
    };

    return (
      latitude >= bounds.minLat &&
      latitude <= bounds.maxLat &&
      longitude >= bounds.minLon &&
      longitude <= bounds.maxLon
    );
  }

  /**
   * Check if location is stale
   * @param {Date} timestamp - Location timestamp
   * @param {number} maxMinutes - Maximum age in minutes
   * @returns {boolean} True if stale
   */
  isLocationStale(timestamp, maxMinutes = 10) {
    const now = new Date();
    const diffMs = now - new Date(timestamp);
    const diffMinutes = diffMs / 60000;
    return diffMinutes > maxMinutes;
  }

  /**
   * Get human-readable time ago
   * @param {Date} timestamp - Timestamp
   * @returns {string} Time ago string
   */
  getTimeAgo(timestamp) {
    const now = new Date();
    const diffMs = now - new Date(timestamp);
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  }

  /**
   * Get heading direction from degrees
   * @param {number} heading - Heading in degrees
   * @returns {string} Direction (N, NE, E, SE, S, SW, W, NW)
   */
  getHeadingDirection(heading) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(heading / 45) % 8;
    return directions[index];
  }

  /**
   * Transform location data
   * @param {Object} location - Raw location data
   * @returns {Object} Transformed data
   */
  transformLocationData(location) {
    return {
      id: location._id.toString(),
      bus: location.busId
        ? {
            id: location.busId._id?.toString() || location.busId,
            registrationNumber: location.busId.registrationNumber,
            capacity: location.busId.capacity,
            status: location.busId.status,
            model: location.busId.model,
          }
        : null,
      route: location.routeId
        ? {
            id: location.routeId._id?.toString() || location.routeId,
            name: location.routeId.name,
            routeNumber: location.routeId.routeNumber,
            origin: location.routeId.origin,
            destination: location.routeId.destination,
          }
        : null,
      latitude: location.latitude,
      longitude: location.longitude,
      speed: location.speed,
      speedMph: Math.round(location.speed * 0.621371 * 10) / 10,
      heading: location.heading,
      headingDirection: this.getHeadingDirection(location.heading),
      accuracy: location.accuracy,
      altitude: location.altitude,
      timestamp: location.timestamp,
      source: location.source,
      routeId: location.routeId,
      isMoving: location.isMoving || false,
    };
  }
}

module.exports = new LocationService();
