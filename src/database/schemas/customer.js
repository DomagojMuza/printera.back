const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    customerId: {
        type: Number,
        required: [true, 'Enter starting date'],
    },
    firstName: {
        type: String,
        required: [true, 'Enter starting date'],
    },
    lastName: {
        type: String,
        required: [true, 'Enter starting date'],
    },
    email: {
        type: String,
        required: [true, 'Enter starting date'],
      },
}, {
    timestamps: true
})

customerSchema.statics.findNextCustomerId = async function (callback) {

    let obj = await this.findOne() // 'this' now refers to the Member class
      .sort('-customerId')
      .exec(callback);

    if (! obj) return 1;

    return ++obj.customerId;

}


const Customer = mongoose.model('Customer', customerSchema)


module.exports = Customer