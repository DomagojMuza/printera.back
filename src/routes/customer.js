const express = require('express')
const Customer = require('../database/schemas/customer.js')
const mongoose = require("mongoose");

// const jwt = require('jsonwebtoken');
// const auth = require('../auth/auth.js');


const UserRoute = new express.Router()


// write route /api/customers/:id to patch user 
UserRoute.patch('/api/customers', async (req, res) => {
    const _id = req.body._id;
    const notAllowed = ['_id', 'createdAt', 'updatedAt', '__v', 'image'];
    try {
        Object.keys(req.body).forEach( key => {
            console.log(notAllowed.includes(key));
            if (notAllowed.includes(key)) delete req.body[key];
        });
        await Customer.findOneAndUpdate({_id}, req.body)
        let obj = await Customer.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(_id)}
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

UserRoute.post('/api/customers', async (req, res) => {
    try {
        let customerId = await Customer.findNextCustomerId();
        req.body.customerId = customerId;

        const user = new Customer(req.body)
        await user.save()
        res.status(201).send(user)
    } catch (error) {
        res.status(406).send({ error: error.message })
    }
})

UserRoute.delete('/api/customers/:id', async (req, res) => {
    try {
        const user = await Customer.findByIdAndDelete(req.params.id)

        if (!user) res.status(404).send()
        res.status(200).send(user)
    } catch (error) {
        res.status(400).send({ error: error.message })
    }
})

/// Get all customers with skip and limit

UserRoute.get('/api/customers', async (req, res) => {
    try {
        let search = { $and: [] };
        let skip = 0;
        let limit = +req.query.limit || 20;

        if (req.query._id) search.$and.push({ _id: new mongoose.Types.ObjectId(req.query._id)})

        if (req.query.skip) {
            skip = req.query.skip > 1 ? req.query.skip - 1 : skip;
            delete req.query.skip
        }

        skip = limit * skip;
        if (req.query.name) {
            let nameParts = req.query.name.split(' ');
            nameParts.forEach(element => {
                search.$and.push({
                    $or: [{ firstName: { $regex: '.*' + element + '.*', $options: 'i' } },
                    { lastName: { $regex: '.*' + element + '.*', $options: 'i' } }]
                })
            });
        }
        if (req.query.email) {
            search.$and.push({$or: [{ email: { $regex: '.*' + req.query.email + '.*', $options: 'i' } }] })
        }
        
        if (search.$and.length === 0) delete search.$and;

        const customers = await Customer.aggregate([
            {
                $match: search
            },
            // {
            //     $lookup: {
            //       from: "images",
            //       localField: "object_id",
            //       foreignField: "object_id",
            //       as: "image",
            //     },
            // },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            }
        ])
        let count = await Customer.countDocuments(search);

        res.status(200).send({customers, count})
    } catch (error) {
        res.status(400).send({ error: error.message })
    }
})


module.exports = UserRoute

