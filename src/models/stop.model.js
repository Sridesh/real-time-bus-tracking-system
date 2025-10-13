const mongoose = require('mongoose');

/**
 * Stop Schema - Individual bus stops along a route
 */
const stopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Stop name is required'],
      trim: true,
    },
    sequence: {
      type: Number,
      required: [true, 'Stop sequence is required'],
      min: [1, 'Sequence must be at least 1'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Coordinates are required'],
        validate: {
          validator: function (coords) {
            return (
              coords.length === 2 &&
              coords[0] >= -180 &&
              coords[0] <= 180 && // longitude
              coords[1] >= -90 &&
              coords[1] <= 90 // latitude
            );
          },
          message: 'Invalid coordinates format [longitude, latitude]',
        },
      },
    },
    estimatedArrival: {
      type: Number, // Minutes from origin
      default: 0,
    },
  },
  { _id: false } // Don't create separate _id for stops
);

const Stop = mongoose.model('stop', stopSchema);

module.exports = { Stop, stopSchema };
