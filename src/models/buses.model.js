const mongoose = require('mongoose');

/**
 * Bus Schema - Defines the structure of "Bus" model
 */

const busSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      trim: true,
    },
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Operator',
      required: [true, 'Operator ID is required'],
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      default: null,
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [10, 'Capacity must be at least 10'],
      max: [100, 'Capacity cannot exceed 100'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance', 'out_of_service'],
      default: 'active',
    },
    model: {
      type: String,
      trim: true,
    },
    // yearManufactured: {
    //   type: Number,
    //   min: 1990,
    //   max: new Date().getFullYear(),
    // },
    features: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const busModel = mongoose.model('Bus', busSchema);

module.exports = busModel;
