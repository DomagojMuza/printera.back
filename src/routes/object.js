const express = require('express')
const Object_catalogue = require('../database/schemas/object.js')
const Pricelist = require('../database/schemas/pricelist.js')
const Image = require('../database/schemas/images.js')
const mongoose = require("mongoose");

const auth = require('../auth/auth.js');


const object = new express.Router()

object.post('/api/object', async (req, res) => {
    try {
        let object_id = await Object_catalogue.findNextObjectId();
        req.body.object_id = object_id;


        let obj = new Object_catalogue(
            req.body
        )
        await obj.save();

        return res.status(200).send(obj)

    } catch (error) {
        return res.status(400).send(error)
    }

})

object.patch('/api/object', async (req, res) => {
    const _id = req.body._id;
    const notAllowed = ['_id', 'createdAt', 'updatedAt', '__v', 'image'];
    try {
        Object.keys(req.body).forEach( key => {
            console.log(notAllowed.includes(key));
            if (notAllowed.includes(key)) delete req.body[key];
        });
        await Object_catalogue.findOneAndUpdate({_id}, req.body)
        let obj = await Object_catalogue.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(_id)}
            },
            {
                $lookup: {
                  from: "images",
                  localField: "object_id",
                  foreignField: "object_id",
                  as: "image",
                },
            },
            {
                $limit: 1,
            },
        ])  
        res.status(200).send(obj[0]);

    } catch (error) {
        res.status(400).send(error)
    }

})

object.get('/api/object', async (req, res) => {
    let search = { $and: [{ isDeleted: 'No'}] };
    let limit = +req.query.limit || 10;
    let skip = 0;
    let lookUp = [
        {
            $lookup: {
                from: "images",
                localField: "object_id",
                foreignField: "object_id",
                as: "image",
            }
        }
    ];

    let pricelistLookup = {
        $lookup: {
            from: "pricelists",
            localField: "object_id",
            foreignField: "object_id",
            as: "pricelist",
        }
    }

    if (req.query.pricelistLookup) lookUp.push(pricelistLookup);


    if (req.query.maxObjectPersons && req.query.maxObjectPersons > 0)   search.$and.push({ maxObjectPersons: { $gte: +req.query.maxObjectPersons} })
    if (req.query.numberOfBathrooms && req.query.numberOfBathrooms > 0) search.$and.push({ numberOfBathrooms: { $gte: +req.query.numberOfBathrooms} })
    if (req.query.rooms && req.query.rooms > 0)                         search.$and.push({ rooms: { $gte: +req.query.rooms} })
    if (req.query.distanceSea && req.query.distanceSea > 0)             search.$and.push({ distanceSea: { $lte: +req.query.distanceSea} })
    if (req.query.distanceCenter && req.query.distanceCenter > 0)       search.$and.push({ distanceCenter: { $lte: +req.query.distanceCenter} })
    if (req.query.distanceBeach && req.query.distanceBeach > 0)         search.$and.push({ distanceBeach: { $lte: +req.query.distanceBeach} })

    if (req.query.name) 
    {
        let $or = [];
        if (isNaN(+req.query.name)) 
        {
            $or = [{ name: { $regex: '.*' + req.query.name + '.*' , $options : 'i' } }];
        }
        else 
        {
            if (typeof +req.query.name === 'number') $or.push({ object_id: +req.query.name })
        }
        search.$and.push({ $or });
    }

    if (req.query.pool && req.query.pool === 'true')             search.$and.push({ pool: true})
    if (req.query.parking && req.query.parking === 'true')          search.$and.push({ parking: true})
    if (req.query.ac && req.query.ac === 'true')               search.$and.push({ ac: true})
    if (req.query.pets && req.query.pets === 'true')             search.$and.push({ pets: true})
    if (req.query.satTV && req.query.satTV === 'true')            search.$and.push({ satTV: true})
    if (req.query.grill && req.query.grill === 'true')            search.$and.push({ grill: true})
    if (req.query.internet && req.query.internet === 'true')         search.$and.push({ internet: true})
    if (req.query.washingMachine && req.query.washingMachine === 'true')   search.$and.push({ washingMachine: true})
    if (req.query.seaView && req.query.seaView === 'true')          search.$and.push({ seaView: true})

    if (req.query._id)         search.$and.push({ _id: new mongoose.Types.ObjectId(req.query._id)})


    if (req.query.skip)
    {
        skip = req.query.skip > 1 ? req.query.skip - 1 : skip;
        delete req.query.skip
    }
    if(req.query.forUser)
    {
        if ( ! req.user) return [];
        search.owner = req.user._id;
    }

    skip = limit * skip; 
    try {
        

        let objects = await Object_catalogue.aggregate([
            {
                $match: search
            },
            ...lookUp,
            {
                $skip: +skip,
            },
            {
                $limit: +limit,
            },
        ])        

        let count = await Object_catalogue.countDocuments(search);
        res.status(200).send({objects, count})
    } catch (error) {
        console.log(error);
        res.status(400).send(error)
    }
})

object.get('/api/object/:id', async (req, res) => {
    const _id = req.params.id;
    try {
        let object = await Objects.findOne({
            _id
        }).populate('images').populate('pricelist');
        res.status(200).send(object)
    } catch (error) {
        res.status(400).send(error)
    }
})

object.delete('/api/object/:id', async (req, res) => {
    const _id = req.params.id;
    try {
        let object = await Object_catalogue.findOneAndUpdate({_id}, {isDeleted: 'Yes'});
        res.status(200).send(object)
    } catch (error) {
        console.log(error);
        res.status(400).send(error)
    }
})



module.exports = object