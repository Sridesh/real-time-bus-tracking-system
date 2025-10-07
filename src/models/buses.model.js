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
      uppercase: true,
      // match: [
      //   /^[A-Z]{2}-[A-Z]{3}-\d{4}$/,
      //   'Registration must be in format: XX-XXX-XXXX (e.g., WP-CAB-1234)',
      // ],
    },
    // operatorId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Operator',
    //   required: [true, 'Operator ID is required'],
    //   index: true,
    // },
    // routeId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Route',
    //   default: null,
    //   index: true,
    // },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [10, 'Capacity must be at least 10'],
      max: [100, 'Capacity cannot exceed 100'],
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
        values: ['Ashok Leyland', 'TATA', 'Rosa', 'Isuzu'],
        message: '{VALUE} is not a supported manufacturer',
      },
      default: 'Other',
    },
    yearManufactured: {
      type: Number,
      min: [1990, 'Year must be 1990 or later'],
      max: [new Date().getFullYear(), 'Year cannot be in the future'],
    },
    fuelType: {
      type: String,
      enum: ['Diesel', 'Petrol', 'Electric', 'Hybrid', 'CNG'],
      default: 'Diesel',
    },
    licensePlateExpiry: {
      type: Date,
    },
    insuranceExpiry: {
      type: Date,
    },
    isTracking: {
      type: Boolean,
      default: false, // Whether GPS tracking is currently active
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for common queries
busSchema.index({ registrationNumber: 1 }, { unique: true });
// busSchema.index({ operatorId: 1, status: 1 });
// busSchema.index({ routeId: 1, status: 1 });
busSchema.index({ status: 1, isTracking: 1 });

/**
 * Virtual field - Current location (most recent)
 */
busSchema.virtual('currentLocation', {
  ref: 'Location',
  localField: '_id',
  foreignField: 'busId',
  justOne: true,
  options: { sort: { timestamp: -1 } }, // Get most recent
});

/**
 * Virtual field - Location history
 */
busSchema.virtual('locationHistory', {
  ref: 'Location',
  localField: '_id',
  foreignField: 'busId',
});

/**
 * Virtual field - Age of bus (in years)
 */
busSchema.virtual('age').get(function () {
  if (!this.yearManufactured) return null;
  return new Date().getFullYear() - this.yearManufactured;
});

/**
 * Virtual field - Is maintenance due
 */
busSchema.virtual('isMaintenanceDue').get(function () {
  if (!this.nextMaintenanceDate) return false;
  return new Date() >= this.nextMaintenanceDate;
});

/**
 * Virtual field - Is license expired
 */
busSchema.virtual('isLicenseExpired').get(function () {
  if (!this.licensePlateExpiry) return false;
  return new Date() >= this.licensePlateExpiry;
});

/**
 * Virtual field - Is insurance expired
 */
busSchema.virtual('isInsuranceExpired').get(function () {
  if (!this.insuranceExpiry) return false;
  return new Date() >= this.insuranceExpiry;
});

/**
 * Instance method - Check if bus is operational
 */
busSchema.methods.isOperational = function () {
  return (
    this.status === 'active' &&
    !this.isMaintenanceDue &&
    !this.isLicenseExpired &&
    !this.isInsuranceExpired
  );
};

/**
 * Instance method - Update odometer
 */
busSchema.methods.updateOdometer = async function (distance) {
  this.odometer += distance;
  await this.save();
};

/**
 * Instance method - Start tracking
 */
busSchema.methods.startTracking = async function () {
  this.isTracking = true;
  await this.save();
};

/**
 * Instance method - Stop tracking
 */
busSchema.methods.stopTracking = async function () {
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
 * Static method - Find buses needing maintenance
 */
busSchema.statics.findMaintenanceDue = function () {
  return this.find({
    nextMaintenanceDate: { $lte: new Date() },
    status: { $ne: 'maintenance' },
  });
};

/**
 * Static method - Find active tracking buses
 */
busSchema.statics.findActiveTracking = function () {
  return this.find({ isTracking: true, status: 'active' });
};

/**
 * Pre-save middleware - Update maintenance status
 */
busSchema.pre('save', function (next) {
  // Automatically set status to maintenance if maintenance is due
  if (this.isMaintenanceDue && this.status === 'active') {
    this.status = 'maintenance';
  }
  next();
});

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
