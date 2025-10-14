const mongoose = require('mongoose');

/**
 * Operator Schema - Bus operator/company information
 */
const operatorSchema = new mongoose.Schema(
  {
    userId: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      required: [true, 'User Id is required'],
      trim: true,
      lowercase: true,
    },
    licenseNumber: {
      type: String,
      required: [true, 'License number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    province: {
      type: String,
      required: [true, 'Province is required'],
      enum: {
        values: [
          'Western',
          'Central',
          'Southern',
          'Northern',
          'Eastern',
          'North Western',
          'North Central',
          'Uva',
          'Sabaragamuwa',
        ],
        message: '{VALUE} is not a valid province',
      },
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'suspended', 'inactive'],
        message: '{VALUE} is not a valid status',
      },
      default: 'active',
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
operatorSchema.index({ province: 1, status: 1 });
operatorSchema.index({ email: 1 });

/**
 * Virtual field - Total buses count
 */
operatorSchema.virtual('totalBuses', {
  ref: 'Bus',
  localField: '_id',
  foreignField: 'operatorId',
  count: true,
});

/**
 * Virtual field - Active buses count
 */
operatorSchema.virtual('activeBuses', {
  ref: 'Bus',
  localField: '_id',
  foreignField: 'operatorId',
  count: true,
  match: { status: 'active' },
});

/**
 * Instance method - Check if operator is active
 */
operatorSchema.methods.isOperatorActive = function () {
  return this.status === 'active';
};

/**
 * Static method - Find operators by province
 */
operatorSchema.statics.findByProvince = function (province, status = 'active') {
  return this.find({ province, status }).populate('totalBuses');
};

/**
 * Pre-remove middleware - Prevent deletion if operator has buses
 */
operatorSchema.pre('remove', async function (next) {
  const Bus = mongoose.model('Bus');
  const busCount = await Bus.countDocuments({ operatorId: this._id });

  if (busCount > 0) {
    throw new Error('Cannot delete operator with existing buses');
  }

  next();
});

const Operator = mongoose.model('Operator', operatorSchema);

module.exports = Operator;
