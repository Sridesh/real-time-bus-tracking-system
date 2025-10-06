const mongoose = require('mongoose');

const busSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    route: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const busModel = mongoose.model('Bus', busSchema);

module.exports = busModel;
