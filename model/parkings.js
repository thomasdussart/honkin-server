const mongoose = require("mongoose");

const parkingsSchema = new mongoose.Schema({
  fields: {
    name: { type: String, default: null },
    street_name: { type: String, default: null },
    postal_code: { type: String, default: null },
    city: { type: String, default: null },
  },
  geometry: {
    coordinates: { type: Array, default: null },
  },
});

module.exports = mongoose.model("parkings", parkingsSchema);
