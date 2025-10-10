const mongoose = require('mongoose');

/**
 * Location Schema - GPS tracking data for buses
 * This is the CORE model for real-time tracking
 * Uses MongoDB's GeoJSON format for geospatial queries
 */
const locationSchema = new mongoose.Schema(
  {
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: [true, 'Bus ID is required'],
      index: true,
    },
    coordinates: {
      // for quickly finding locations
      type: [Number],
      required: [true, 'Coordinates are required'],
      validate: {
        validator: function (coords) {
          return (
            coords.length === 2 &&
            coords[0] >= -180 &&
            coords[0] <= 180 &&
            coords[1] >= -90 &&
            coords[1] <= 90
          );
        },
        message: 'Invalid coordinates. Must be [longitude, latitude]',
      },
      default: [0, 0],
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180'],
    },
    speed: {
      type: Number, // kmph metric
      default: 0,
      min: [0, 'Speed cannot be negative'],
      max: [200, 'Speed cannot exceed 200 km/h'],
    },
    heading: {
      type: Number, // direction of travel in gps data (0-360)
      default: 0,
      min: [0, 'Heading must be between 0 and 360'],
      max: [360, 'Heading must be between 0 and 360'],
    },
    accuracy: {
      type: Number, // GPS accuracy in meters
      default: 10,
      min: [0, 'Accuracy cannot be negative'],
    },
    altitude: {
      type: Number, // meters above sea level
      default: null,
    },
    timestamp: {
      type: Date,
      required: [true, 'Timestamp is required'],
      default: Date.now,
      index: true,
    },
    source: {
      type: String,
      enum: ['gps', 'manual', 'estimated'],
      default: 'gps',
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      default: null,
      index: true,
    },
    isMoving: {
      type: Boolean,
      default: false, // Calculated based on speed
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// **CRITICAL** - 2dsphere index for geospatial queries
locationSchema.index({ location: '2dsphere' });

// Compound indexes for common queries
locationSchema.index({ busId: 1, timestamp: -1 }); // Get recent locations for a bus
locationSchema.index({ timestamp: -1 }); // Get recent locations
locationSchema.index({ busId: 1, createdAt: -1 }); // Latest location per bus
locationSchema.index({ routeId: 1, timestamp: -1 }); // Locations by route

// keeps only last 1 day of location history
locationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 1 * 24 * 60 * 60 });

/**
 * Virtual field - Get bus details
 */
locationSchema.virtual('bus', {
  ref: 'Bus',
  localField: 'busId',
  foreignField: '_id',
  justOne: true,
});

/**
 * Virtual field - Speed in kmph
 */
locationSchema.virtual('speedKph').get(function () {
  return Math.round(this.speed * 3.6);
});

/**
 * Virtual field - Formatted coordinates (lat, lng)
 */
locationSchema.virtual('formattedCoordinates').get(function () {
  return {
    lat: this.latitude,
    lng: this.longitude,
  };
});

/**
 * Virtual field - Human-readable heading
 */
locationSchema.virtual('headingDirection').get(function () {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(this.heading / 45) % 8;
  return directions[index];
});

/**
 * Pre-save middleware - Sync location field with lat/lng
 */
locationSchema.pre('save', async function (next) {
  this.coordinates = [this.longitude, this.latitude];

  // Setting isMoving based on speed is above 5kmph
  this.isMoving = this.speed > 5;

  next();
});

/**
 * Instance method - Calculate distance to another location
 * @param {Object} targetLocation - Target location {latitude, longitude}
 * @returns {Number} Distance in kilometers
 */
locationSchema.methods.distanceTo = function (targetLocation) {
  const R = 6371; // Earth's radius in km
  const dLat = this.toRad(targetLocation.latitude - this.latitude);
  const dLon = this.toRad(targetLocation.longitude - this.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(this.toRad(this.latitude)) *
      Math.cos(this.toRad(targetLocation.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Helper method - Convert degrees to radians
 */
locationSchema.methods.toRad = function (degrees) {
  return (degrees * Math.PI) / 180;
};

/**
 * Instance method - Check if location is stale
 * @param {Number} maxMinutes - Maximum minutes old (default: 5)
 * @returns {Boolean} True if stale
 */
locationSchema.methods.isStale = function (maxMinutes = 5) {
  const now = new Date();
  const diffMinutes = (now - this.timestamp) / (1000 * 60);
  return diffMinutes > maxMinutes;
};

/**
 * Static method - Find locations within radius
 * @param {Number} longitude - Center longitude
 * @param {Number} latitude - Center latitude
 * @param {Number} radiusKm - Radius in kilometers
 * @param {Object} options - Additional query options
 * @returns {Promise<Array>} Array of locations
 */
locationSchema.statics.findNearby = function (longitude, latitude, radiusKm = 5, options = {}) {
  const radiusMeters = radiusKm * 1000;

  const query = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: radiusMeters,
      },
    },
  };

  // Only get recent locations (last 10 minutes by default)
  const timeLimit = options.timeLimit || 10;
  const cutoffTime = new Date(Date.now() - timeLimit * 60 * 1000);
  query.timestamp = { $gte: cutoffTime };

  return (
    this.find(query)
      .populate('busId', 'registrationNumber capacity status')
      // .populate('routeId', 'name routeNumber origin destination')
      .limit(options.limit || 50)
      .lean()
  );
};

/**
 * Static method - Find locations within a polygon area
 * @param {Array} coordinates - Array of [lng, lat] pairs defining polygon
 * @returns {Promise<Array>} Array of locations
 */
locationSchema.statics.findInArea = function (coordinates) {
  return this.find({
    location: {
      $geoWithin: {
        $geometry: {
          type: 'Polygon',
          coordinates: [coordinates],
        },
      },
    },
  })
    .populate('busId')
    .lean();
};

/**
 * Static method - Get latest location for each bus
 * @param {Object} filter - Additional filters
 * @returns {Promise<Array>} Array of latest locations
 */
locationSchema.statics.getLatestPerBus = async function (filter = {}) {
  return this.aggregate([
    // Match filter conditions
    { $match: filter },
    // Sort by timestamp descending
    { $sort: { timestamp: -1 } },
    // Group by busId and get first (latest) document
    {
      $group: {
        _id: '$busId',
        latestLocation: { $first: '$ROOT' },
      },
    },
    // Replace root with the latest location document
    { $replaceRoot: { newRoot: '$latestLocation' } },
    // Lookup bus details
    {
      $lookup: {
        from: 'buses',
        localField: 'busId',
        foreignField: '_id',
        as: 'bus',
      },
    },
    { $unwind: '$bus' },
  ]);
};

/**
 * Static method - Get location history for a bus
 * @param {String} busId - Bus ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {Number} limit - Max results
 * @returns {Promise<Array>} Array of locations
 */
locationSchema.statics.getHistory = function (busId, startDate, endDate, limit = 1000) {
  const query = {
    busId,
    timestamp: {
      $gte: startDate,
      $lte: endDate,
    },
  };

  return this.find(query)
    .sort({ timestamp: 1 }) // Oldest first for route replay
    .limit(limit)
    .lean();
};

/**
 * Static method - Calculate distance traveled
 * @param {String} busId - Bus ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Number>} Total distance in kilometers
 */
locationSchema.statics.calculateDistanceTraveled = async function (busId, startDate, endDate) {
  const locations = await this.find({
    busId,
    timestamp: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .sort({ timestamp: 1 })
    .lean();

  if (locations.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 1; i < locations.length; i++) {
    const prev = locations[i - 1];
    const curr = locations[i];

    // Calculate distance between consecutive points
    const R = 6371; // Earth's radius in km
    const dLat = ((curr.latitude - prev.latitude) * Math.PI) / 180;
    const dLon = ((curr.longitude - prev.longitude) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((prev.latitude * Math.PI) / 180) *
        Math.cos((curr.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    totalDistance += R * c;
  }

  return Math.round(totalDistance * 100) / 100; // Round to 2 decimals
};

/**
 * Static method - Get average speed for a bus
 * @param {String} busId - Bus ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Number>} Average speed in km/h
 */
locationSchema.statics.getAverageSpeed = async function (busId, startDate, endDate) {
  const result = await this.aggregate([
    {
      $match: {
        busId: mongoose.Types.ObjectId(busId),
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        },
        isMoving: true,
      },
    },
    {
      $group: {
        _id: null,
        avgSpeed: { $avg: '$speed' },
      },
    },
  ]);

  return result.length > 0 ? Math.round(result[0].avgSpeed * 10) / 10 : 0;
};

/**
 * Static method - Find buses near a route
 * @param {String} routeId - Route ID
 * @param {Number} radiusKm - Search radius in km
 * @returns {Promise<Array>} Buses near the route
 */
locationSchema.statics.findBusesNearRoute = async function (routeId, radiusKm = 2) {
  const Route = mongoose.model('Route');
  const route = await Route.findById(routeId);

  if (!route || !route.stops || route.stops.length === 0) {
    return [];
  }

  // Get all route stop coordinates
  const stopCoordinates = route.stops.map((stop) => stop.location.coordinates);

  // Find locations near any stop
  const nearbyLocations = await this.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: stopCoordinates[0], // Start with first stop
        },
        distanceField: 'distance',
        maxDistance: radiusKm * 1000,
        spherical: true,
      },
    },
    {
      $group: {
        _id: '$busId',
        latestLocation: { $first: '$ROOT' },
      },
    },
  ]);

  return nearbyLocations;
};

/**
 * Static method - Clean up old locations (maintenance)
 * @param {Number} daysToKeep - Days of history to keep
 * @returns {Promise<Object>} Deletion result
 */
locationSchema.statics.cleanupOldLocations = function (daysToKeep = 1) {
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
  return this.deleteMany({ createdAt: { $lt: cutoffDate } });
};

/**
 * Post-save middleware - Update bus tracking status
 */
locationSchema.post('save', async function (doc) {
  try {
    const Bus = mongoose.model('Bus');
    await Bus.findByIdAndUpdate(doc.busId, {
      isTracking: true,
      averageSpeed: doc.speed,
    });
  } catch (error) {
    // Log error but don't fail the save
    console.error('Error updating bus tracking status:', error);
  }
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
