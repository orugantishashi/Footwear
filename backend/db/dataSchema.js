const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: false
  },
  name: {
    type: String,
    required: true
  },
  brand: String,
  category: String,
  price: Number,
  color: String,
  description: String,
  image: String
}, { timestamps: true });

module.exports = mongoose.model('productsdb', storeSchema);