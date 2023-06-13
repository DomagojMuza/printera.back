const mongoose = require('mongoose');


const ObjectSchema = new mongoose.Schema({
    name:
    {
        type: String,
        required: [true, 'How you want to name your object'],
        trim: true
    },
    maxObjectPersons:
    {
        type: Number,
        default: 0,
    },
    numberOfBathrooms:
    {
        type: Number,
        default: 0,
    },
    rooms:
    {
        type: Number,
        default: 0,
    },
    distanceSea:
    {
        type: Number,
        default: 0,
    },
    distanceCenter:
    {
        type: Number,
        default: 0,
    },
    distanceBeach:
    {
        type: Number,
        default: 0,
    },
    pool:
    {
        type: Boolean,
        default: false,
    },
    parking:
    {
        type: Boolean,
        default: false,
    },
    ac:
    {
        type: Boolean,
        default: false,
    },
    pets:
    {
        type: Boolean,
        default: false,
    },
    satTV:
    {
        type: Boolean,
        default: false,
    },
    grill:
    {
        type: Boolean,
        default: false,
    },
    internet:
    {
        type: Boolean,
        default: false,
    },
    washingMachine:
    {
        type: Boolean,
        default: false,
    },
    seaView:
    {
        type: Boolean,
        default: false,
    },
    lat:
    {
        type: Number,
        default: 0,
    },
    lng:
    {
        type: Number,
        default: 0,
    },
    object_id: 
    {
        type: Number
    },
    isDeleted: {
        type: String,
        default: 'No'
    }
}, {
    timestamps: true
})

ObjectSchema.statics.findNextObjectId = async function (callback) {

    let obj = await this.findOne() // 'this' now refers to the Member class
      .sort('-object_id')
      .exec(callback);

    if (! obj) return 1;

    return ++obj.object_id;

}


const object_catalogue = mongoose.model('object_catalogue', ObjectSchema)




module.exports = object_catalogue