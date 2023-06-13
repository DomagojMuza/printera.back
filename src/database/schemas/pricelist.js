const mongoose = require('mongoose');
const Object = require('./object.js')



const PricelistSchema = new mongoose.Schema({
  dateFrom: {
    type: Date,
    required: [true, 'Enter starting date'],
  },
  dateTo: {
    type: Date,
    required: [true, 'Enter ending date'],
  },
  price: {
    type: Number,
    required: [true, 'Enter price'],
  },
  object_id: {
    type: Number,
  }
}, {
  timestamps: true
})


const Pricelist = mongoose.model('Pricelist', PricelistSchema)


module.exports = Pricelist