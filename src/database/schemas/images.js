const mongoose = require('mongoose');



const ImageSchema = new mongoose.Schema({
    filename:
    {
        type: String,
    },
    object_id:
    {
        type: Number
    }
}, {
    timestamps: true
})

// ImageSchema.pre('remove', async function(next){
//     const image = this
//     console.log(image);
//     await Object.updateOne({ _id: image.object_id}, {
//         $pullAll: {
//             images: [{_id: image._id}]
//         }
//     });
//     next()
// })

const Image = mongoose.model('Image', ImageSchema)


module.exports = Image