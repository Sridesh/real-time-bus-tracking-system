const mongoose = require('mongoose');

/**
 * Bus Schema - Individual bus information
 */
const busSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      trim: true,
      lowercase: true,
      // match: [
      //   /^[A-Z]{2}-[A-Z]{3}-\d{4}$/,
      //   'Registration must be in format: XX-XXX-XXXX',
      // ],
    },
    operatorId: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Operator',
      required: [true, 'Operator ID is required'],
      index: true,
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      default: null,
      index: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [30, 'Capacity must be at least 10'],
      max: [70, 'Capacity cannot exceed 100'],
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'maintenance', 'out_of_service'],
        message: '{VALUE} is not a valid status',
      },
      default: 'active',
      index: true,
    },
    model: {
      type: String,
      trim: true,
      maxlength: [100, 'Model name cannot exceed 100 characters'],
    },
    manufacturer: {
      type: String,
      trim: true,
      enum: {
        values: ['Ashok Leyland', 'TATA', 'Rosa'],
        message: '{VALUE} is not a supported manufacturer',
      },
      default: 'Other',
    },
    features: {
      type: [String],
      default: [],
      enum: {
        values: ['AC', 'WiFi', 'Television', 'Music', 'Reclining Seats', 'Entertainment System'],
        message: '{VALUE} is not a valid feature',
      },
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    isTracking: {
      type: Boolean,
      default: false,
    },
    isRunning: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// indexes
busSchema.index({ operatorId: 1, status: 1 });
busSchema.index({ routeId: 1, status: 1 });
busSchema.index({ status: 1, isTracking: 1 });
busSchema.index({ isPrivate: 1 });

/**
 * Virtual fields
 */
busSchema.virtual('currentLocation', {
  ref: 'Location',
  localField: '_id',
  foreignField: 'busId',
  justOne: true,
  options: { sort: { timestamp: -1 } }, // Get most recent
});

busSchema.virtual('locationHistory', {
  ref: 'Location',
  localField: '_id',
  foreignField: 'busId',
});

/**
 * Instance method - Start tracking
 */
busSchema.methods.startRunning = async function () {
  this.isRunning = true;
  this.isTracking = true;
  await this.save();
};

/**
 * Instance method - Stop tracking
 */
busSchema.methods.stopRunning = async function () {
  this.isRunning = false;
  this.isTracking = false;
  await this.save();
};

/**
 * Static method - Find buses by operator
 */
busSchema.statics.findByOperator = function (operatorId, status = null) {
  const query = { operatorId };
  if (status) query.status = status;
  return this.find(query).populate('routeId', 'name routeNumber origin destination');
};

/**
 * Static method - Find buses on route
 */
busSchema.statics.findByRoute = function (routeId, activeOnly = true) {
  const query = { routeId };
  if (activeOnly) query.status = 'active';
  return this.find(query).populate('operatorId', 'name contactPerson');
};

/**
 * Static method - Find active tracking buses
 */
busSchema.statics.findActiveTracking = function () {
  return this.find({ isTracking: true, status: 'active' });
};

/**
 * Static method - Find active tracking buses
 */
busSchema.statics.findRunningBuses = function () {
  return this.find({ isRunning: true, status: 'active' });
};

/**
 * Pre-remove middleware - Clean up related location data
 */
busSchema.pre('remove', async function (next) {
  const Location = mongoose.model('Location');
  await Location.deleteMany({ busId: this._id });
  next();
});

const Bus = mongoose.model('Bus', busSchema);

module.exports = Bus;
