const express = require('express')
const Pricelist = require('../database/schemas/pricelist.js')
const Objects = require('../database/schemas/object.js')
const object_catalogue = require('../database/schemas/object.js')


const pricelist = new express.Router()


pricelist.get('/api/pricelist/:id', async (req, res) => {
      try {
            let items = await Pricelist.aggregate([
                  {
                      $match: {object_id: +req.params.id}
                  },
                  {
                      $lookup: {
                        from: "object_catalogues",
                        localField: "object_id",
                        foreignField: "object_id",
                        as: "object",
                      },
                  }
            ])  
            res.status(200).send(items)
      } catch (error) {
            console.log(error);
            res.status(400).send(error)
      }
})



pricelist.post('/api/pricelist', async (req, res) => {
      try {
            if (!(req.body.dateFrom && req.body.dateTo)) throw "Dates missing";
            if (new Date(req.body.dateFrom) > new Date(req.body.dateTo)) throw "Ending date smaller that starting date";
            if (!req.body.object_id) throw "Accomodation missing";

            req.body.dateFrom = new Date(req.body.dateFrom);
            req.body.dateTo = new Date(req.body.dateTo);

            let oPricelist = await hasItemInPeriod(req.body.object_id, req.body.dateFrom, req.body.dateTo);

            console.log(oPricelist);
            if (oPricelist) throw 'There is pricelist item in that period';
            // res.status(201).send(oPricelist);

            let item = new Pricelist({
                  dateFrom: req.body.dateFrom,
                  dateTo: req.body.dateTo,
                  price: req.body.price,
                  object_id: req.body.object_id
            })
            await item.save();


            res.status(200).send(item)

      } catch (error) {
            console.log(error);
            res.status(400).send(error)
      }

})

pricelist.patch('/api/pricelist', async (req, res) => {
      const notAllowed = ['_id', 'object_id', 'createdAt', 'updatedAt', '_v'];
      try {
            req.body.dateFrom = new Date(req.body.dateFrom);
            req.body.dateTo = new Date(req.body.dateTo);
            
            let oPricelist = await hasItemInPeriod(req.body.object_id, req.body.dateFrom, req.body.dateTo, req.body._id);

            if (oPricelist) throw 'There is pricelist item in that period';

            let updates = Object.keys(req.body)
            updates = updates.filter(el => {
                  return !notAllowed.includes(el);
            });
            let item = await Pricelist.findOne({ _id: req.body._id })
            updates.forEach((update) => {
                  if (req.body[update]) item[update] = req.body[update]
            })
            await item.save();
            if (!item) {
                  return res.status(404).send()
            }
            res.status(200).send(item)

      } catch (error) {
            console.log(error);
            res.status(400).send(error)
      }

})

pricelist.delete('/api/pricelist/:id', async (req, res) => {
      const _id = req.params.id;
      try {
            const item = await Pricelist.findOneAndDelete({ _id })
            if (!item) {
                  return res.status(406).send()
            }
            res.send(true);

      } catch (error) {
            res.status(500).send(error);
      }
})

pricelist.post('/api/calculator', async (req, res) => {
      let params = req.body;
      try {
            if (!(params.object_id && params.dateFrom && params.dateTo)) return res.status(400).send("All parameters not sent");

            let itemList = await hasItemInPeriod(params.object_id, params.dateFrom, params.dateTo);
            if (!(itemList && itemList.length > 0)) return res.status(404).send("No pricelist items found");
            let calc = calculator(itemList, params.dateFrom, params.dateTo);
            return res.status(200).send(calc);
      } catch (error) {
            console.log(error);
            res.status(500).send(error);
      }
})

async function hasItemInPeriod(object_id, dateFrom, dateTo, exclude = null) {
      let search = {
            object_id: object_id,
            $or: [
                  {
                        $and: [
                              { dateFrom: { $lte: dateFrom } },
                              { dateTo: { $gt: dateFrom } }
                        ]
                  },
                  {
                        $and: [
                              { dateFrom: { $lte: dateTo } },
                              { dateTo: { $gte: dateTo } }
                        ]
                  },
            ]
      };
      if (exclude) search._id = { $ne: exclude };

      let oPricelist = await Pricelist.find(search);

      return oPricelist.length > 0 ? oPricelist : null;
}

function calculator(pricelist, dateFrom, dateTo) {
      // dateFrom = new Date(dateFrom);
      // dateTo = new Date(dateTo);
      let total = 0;
      let days;
      let allPeriods = [];
      pricelist.forEach(item => {
            days = 0;
            let itemDateFrom = new Date(item.dateFrom).toISOString().substring(0, 10);
            let itemDateTo = new Date(item.dateTo).toISOString().substring(0, 10);
            let period = { dateFrom: itemDateFrom, dateTo: itemDateTo };
            let range = rangesUnion(period, { dateFrom, dateTo });
            allPeriods.push(range.dateFrom, range.dateTo);
            days = calcDays(range);
            if (days > 0) total += days * item.price;
      });
      var bookDateFrom = allPeriods.reduce(function (a, b) { return a < b ? a : b; });
      var bookDateTo = allPeriods.reduce(function (a, b) { return a > b ? a : b; });
      return { total, nights: days, period: { bookDateFrom, bookDateTo } };
}

const isBetween = function (range, date) {
      return range.dateFrom <= date && range.dateTo >= date;
};

const rangesUnion = function (rangeOne, rangeTwo) {
      console.log(rangeOne, rangeTwo);
      // return 0;
      let newRange = {}

      if (isBetween(rangeOne, rangeTwo.dateFrom)) {
            newRange.dateFrom = rangeTwo.dateFrom;
      } else {
            newRange.dateFrom = rangeOne.dateFrom;
      }
      if (isBetween(rangeOne, rangeTwo.dateTo)) {
            newRange.dateTo = rangeTwo.dateTo;
      } else {
            newRange.dateTo = rangeOne.dateTo;
      }

      return newRange;
};

function calcDays(range) {
      if (!(range.dateFrom && range.dateTo)) return 0;
      let diff = diffInDays(range.dateFrom, range.dateTo);
      if (diff < 0) return 0;
      return diff < 1 ? 1 : diff;
}


pricelist.get('/test', async (req, res) => {
      let merge = rangesUnion({ dateFrom: '2022-11-01', dateTo: '2022-11-15' }, { dateFrom: '2022-11-10', dateTo: '2022-11-12' });
      let diff = diffInDays(merge.dateFrom, merge.dateTo);
      res.status(200).send({ merge, diff });
})

function diffInDays(dateFrom, dateTo) {
      dateFrom = new Date(dateFrom);
      dateTo = new Date(dateTo);
      var start = dateFrom.getTime();
      var end = dateTo.getTime();

      // + 1 jer danas - danas je 0, a treba 1
      // jer od 01-15 je 15 dana, a vrati 14 (15-1)
      return Math.round((end - start) / (24 * 3600 * 1000));
}




module.exports = pricelist