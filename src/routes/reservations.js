const express = require('express')
const Reservation = require('../database/schemas/reservation.js')
const mongoose = require("mongoose");

// const jwt = require('jsonwebtoken');
// const auth = require('../auth/auth.js');


const ReservationRoute = new express.Router()


// write route /api/reservation/:id to patch user 
ReservationRoute.patch('/api/reservation', async (req, res) => {
    const _id = req.body._id;
    const notAllowed = ['_id', 'createdAt', 'updatedAt', '__v', 'image'];
    try {
        Object.keys(req.body).forEach(key => {
            console.log(notAllowed.includes(key));
            if (notAllowed.includes(key)) delete req.body[key];
        });
        await Reservation.findOneAndUpdate({ _id }, req.body)
        let obj = await Reservation.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(_id) }
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

ReservationRoute.post('/api/reservation', async (req, res) => {
    try {
        let res_id = await Reservation.findNextReservationId();
        req.body.reservationId = res_id;

        const reservation = new Reservation(req.body)
        await reservation.save()
        res.status(201).send(reservation)
    } catch (error) {
        console.log(error);

        res.status(406).send({ error: error.message })
    }
})

ReservationRoute.delete('/api/reservation/:id', async (req, res) => {
    try {
        const user = await Reservation.findByIdAndDelete({_id: req.params.id})

        if (!user) res.status(404).send()
        res.status(200).send(user)
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: error.message })
    }
})

/// Get all customers with skip and limit

ReservationRoute.get('/api/reservation', async (req, res) => {
    try {
        let search = { $and: [] };
        let skip = 0;
        let limit = +req.query.limit || 20;

        if (req.query._id) search.$and.push({ _id: new mongoose.Types.ObjectId(req.query._id) })

        if (req.query.skip) {
            skip = req.query.skip > 1 ? req.query.skip - 1 : skip;
            delete req.query.skip
        }

        skip = limit * skip;

        if (req.query.object_id) search.$and.push({ objectId: +req.query.object_id})
        if (req.query.customerId) search.$and.push({ customerId: +req.query.customerId})
        if (req.query.rStatus) search.$and.push({ status: req.query.rStatus})




        if (search.$and.length === 0) delete search.$and;
        console.log(search);
        const reservations = await Reservation.aggregate([
            {
                $match: search
            },
            {
                $lookup: {
                    from: "customers",
                    localField: "customerId",
                    foreignField: "customerId",
                    as: "customer",
                },
            },
            {
                $lookup: {
                    from: "object_catalogues",
                    localField: "objectId",
                    foreignField: "object_id",
                    as: "objects",
                },
            },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            }
        ])
        let count = await Reservation.countDocuments(search);

        res.status(200).send({ reservations, count })
    } catch (error) {
        res.status(400).send({ error: error.message })
    }
})


module.exports = ReservationRoute

