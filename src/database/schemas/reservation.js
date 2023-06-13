const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    customerId: {
        type: Number,
        required: [true, 'Enter cid'],
    },
    total: {
        type: Number,
    },
    reservationId: {
        type: Number,
        required: [true, 'Enter rid'],
    },
    objectId: {
        type: Number,
    },
    status: {
        type: String,
        required: [true, 'Enter ststus'],
    },
    dateFrom: {
        type: Date,
        required: [true, 'Enter starting date'],
    },
    dateTo: {
        type: Date,
        required: [true, 'Enter starting date'],
    },
}, {
    timestamps: true
})



reservationSchema.statics.findNextReservationId = async function (callback) {

    let res = await this.findOne() // 'this' now refers to the Member class
        .sort('-reservationId')
        .exec(callback);

    if (!res) return 1;

    return ++res.reservationId;

}

const Reservation = mongoose.model('Reservation', reservationSchema)


module.exports = Reservation