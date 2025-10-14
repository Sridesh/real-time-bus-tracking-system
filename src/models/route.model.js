const mongoose = require('mongoose');
const { stopSchema } = require('./stop.model');

/**
 * Route Schema - Bus route information
 */
const routeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Route name is required'],
      trim: true,
      minlength: [3, 'Route name must be at least 3 characters'],
      maxlength: [200, 'Route name cannot exceed 200 characters'],
    },
    mode: {
      type: String,
      trim: true,
      enum: ['Non-Express', 'Express', 'Highway'],
      required: [true, 'Mode is required'],
    },
    routeNumber: {
      type: String,
      required: [true, 'Route number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    origin: {
      type: String,
      required: [true, 'Origin is required'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    distance: {
      type: Number,
      required: [true, 'Distance is required'],
      min: [0.1, 'Distance must be at least 0.1 km'],
      max: [1000, 'Distance cannot exceed 1000 km'],
    },
    estimatedDuration: {
      type: Number, // In minutes
      required: [true, 'Estimated duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    stops: {
      type: [stopSchema],
      default: [],
      validate: {
        validator: function (stops) {
          const sequences = stops.map((s) => `${s.name} - ${s.city}`);
          const uniqueSequences = new Set(sequences);
          return uniqueSequences.size === sequences.length;
        },
        message: 'Stops must be unique',
      },
    },
    operatingDays: {
      type: [String],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    frequency: {
      type: Number, // Minutes between buses
      min: [5, 'Frequency must be at least 5 minutes'],
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'suspended'],
        message: '{VALUE} is not a valid status',
      },
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
routeSchema.index({ origin: 1, destination: 1 });
routeSchema.index({ status: 1 });
routeSchema.index({ 'stops.location': '2dsphere' }); // Geospatial index for stops

/**
 * Virtual field - Total stops count
 */
routeSchema.virtual('totalStops').get(function () {
  return this.stops.length;
});

/**
 * Virtual field - Average speed (km/h)
 */
routeSchema.virtual('averageSpeed').get(function () {
  if (this.estimatedDuration === 0) return 0;
  return Math.round((this.distance / (this.estimatedDuration / 60)) * 10) / 10;
});

/**
 * Virtual field - Buses on this route
 */
routeSchema.virtual('buses', {
  ref: 'Bus',
  localField: '_id',
  foreignField: 'routeId',
});

/**
 * Instance method - Check if route operates today
 */
routeSchema.methods.isOperatingToday = function () {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  return this.operatingDays.includes(today) && this.status === 'active';
};

/**
 * Static method - Find routes between cities
 */
routeSchema.statics.findRoutesBetween = function (origin, destination) {
  return this.find({
    origin: new RegExp(origin, 'i'),
    destination: new RegExp(destination, 'i'),
    status: 'active',
  });
};

/**
 * Static method - Find routes by distance range
 */
routeSchema.statics.findByDistanceRange = function (minDistance, maxDistance) {
  return this.find({
    distance: { $gte: minDistance, $lte: maxDistance },
    status: 'active',
  });
};

const Route = mongoose.model('Route', routeSchema);

module.exports = Route;
