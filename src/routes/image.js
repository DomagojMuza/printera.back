const express = require('express')
const Image = require('../database/schemas/images.js')
const Object = require('../database/schemas/object.js')
const multer = require('multer');
const path = require('path')


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        let ext = "." + file.originalname.split(".").slice(-1);
        cb(null, Date.now() + '_' + (Math.random() + 1).toString(36).substring(2) + ext)
    }
});

// filter funkcija koja se koristi za provjeru tipa file-a, mora biti jpeg ili png
const fileFilter = function (req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 10
    },
    fileFilter: fileFilter
});


const image = new express.Router()

image.post('/api/images', upload.array('images'), async (req, res) => {
    // res.status(200).send(...arr[0])
    try {
        let ids = [];
        req.files.forEach(async img => {
            let image = new Image({
                filename: img.filename,
                object_id: req.body.object_id
            })
            await image.save();
            ids.push(image._id);
            console.log(ids);
        });
        let obj = await Object.findById(req.body.object_id);
        if (obj['images']) {
            obj['images'].push(...ids)
        } else {
            obj['images'] = ids;
        }
        await obj.save();

        res.status(200).send(obj)

    } catch (error) {
        console.log(error);
        res.status(400).send(error)
    }

})

image.get('/api/uploads/:object/:filename', async (req, res) => {
    let filepath = path.join(__dirname + `/../data/images/${req.params.object}/${req.params.filename}`);
    res.sendFile(filepath);
});

image.get('/api/image/', async (req, res) => {
    try {
        console.log('image '+ req.query.objectId);
        if (!req.query.objectId) throw new Error('Invalid call!');

        let img = await Image.findOne({ object_id: req.query.objectId });
        res.status(200).send(img);
    } catch (error) {
        // console.log(error);
        res.status(400).send(error)
    }
});

image.delete('/api/image/:id', async (req, res) => {
    const _id = req.params.id;
    try {
        const image = await Image.findOneAndDelete({ _id })
        if (!image) {
            return res.status(406).send()
        }
        res.send(image)
    } catch (error) {
        res.status(500).send(error)
    }
})




module.exports = image