var mysql = require('mysql');
const path = require('path')


const express = require('express');
const cors = require('cors');
const object_catalogue = require('./src/database/schemas/object.js');
const pricelist = require('./src/database/schemas/pricelist.js');
const object = require('./src/routes/object.js');
const image = require('./src/routes/image.js');
const pricelistRoute = require('./src/routes/pricelist.js');
const reservationRoute = require('./src/routes/reservations.js');
const customers = require('./src/routes/customer.js');
const reservation = require('./src/database/schemas/reservation.js');
const customer = require('./src/database/schemas/customer.js');
const Image = require('./src/database/schemas/images.js');

var fs = require('fs'), request = require('request');

require('./src/database/connection');
// require('dotenv').config({ path: __dirname + '/.env' })





const app = express();
app.use(cors())
app.use(express.json())
console.log(path.join(__dirname, 'data/images'));
app.use('/uploads', express.static(path.join(__dirname, 'data')))
app.use(object)
app.use(pricelistRoute)
app.use(image)
app.use(customers)
app.use(reservationRoute)

var con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "mars_dev"
});

var download = function(uri, filename, callback){
	request.head(uri, function(err, res, body){
	  console.log('content-type:', res.headers['content-type']);
	  console.log('content-length:', res.headers['content-length']);
  
	  request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
	});
  };
  

//Params from oc
// let params = [
// 	'name',
// 	'maxObjectPersons',
// 	'numberOfBathrooms',
// 	'distanceSea',
// 	'distanceCenter',
// 	'distanceBeach',
// 	'pool',
// 	'parking',
// 	'ac',
// 	'pets',
// 	'satTV',
// 	'grill',
// 	'internet',
// 	'washingMachine',
// 	'seaView',
// 	'lat', 'lng', 'objectId'
// ];

//Params for reservation
let params = [
	'reservationId',
	'objectId',
	'status',
	'total',
	'customerId',	
]

//Params image
// let params = [
// 	'name',
// 	'objectId',
// 	'status',
// 	'total',
// 	'customerId',	
// ]

let port = process.env.PORT || 4000;


// app.use(object)
// app.use(image)
// app.use(user)
// app.use(pricelist)

console.log(process.env.TOKEN_KEY);
app.listen(port, () => {
	console.log(`Server je na portu ${port}`);
})

const { uniqueNamesGenerator, adjectives, colors, animals, names } = require('unique-names-generator');


la = async function () {
	let res = await reservation.find();
	res.forEach(async obj => {
		con.query('select * from reservation_items ri where itemDefinitionId = 1 and reservationId =' + obj.reservationId, async function (err, result, fields) {
			let dateFrom = new Date(result[0].dateFrom.toISOString().split('T')[0]);
			let dateTo = new Date(result[0].dateTo.toISOString().split('T')[0]);

			obj.dateFrom = dateFrom;
			obj.dateTo = dateTo;
			await obj.save();
		})
	})
}


//la();


// const randomName = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals] }); // big_red_donkey

// const shortName = uniqueNamesGenerator({
// 	separator: ' ',
// 	dictionaries: [names, animals], // colors can be omitted here as not used
// 	length: 2
// });

// console.log(shortName);

// con.connect(async function (err) {
// 	console.log(err);
// 	if (err) throw err;
// 	con.query("select distinct i.entityId, i.path from images i inner join v_tracking_details vtd on i.reference = 'Object' and i.order = 1 and i.entityId = vtd.objectId",  
// 		function (err, result, fields) 
// 		{
// 			let baseUri = 'https://mars.istriasun.com/data/objects/images/';
// 			if (err) console.log(err);
// 			result.forEach(async entry => 
// 			{

// 				// let img = {};
// 				// img.filename = entry['path'].split('/')[1];
// 				// img.object_id = entry['entityId'];
// 				// console.log(img);
					
// 				// let obj = new Image(img);

// 				// let response = await obj.save();
// 				// console.log(response);
// 					let imageUrl = baseUri + entry['path'];
// 				let imageName = entry['path'].split('/')[1];
// 				let objectFolder = 'src/data/images/'+entry['entityId']+'/';

// 				if (!fs.existsSync(objectFolder)){
// 					fs.mkdirSync(objectFolder, { recursive: true });
// 				}

// 				if (! fs.existsSync(objectFolder+imageName) || ! fs.statSync(objectFolder+imageName).size)
// 					download(imageUrl, objectFolder+imageName, function(){
// 						console.log('done');
// 					});
				
// 			})
// 		});
// });

// Get all objects
// con.connect(async function (err) {
// 	console.log(err);
// 	if (err) throw err;
// 	con.query("select distinct oc.* from object_catalogue oc inner join v_tracking_details vtd on vtd.objectId = oc.objectId where oc.typeId in (2,3,4)",  
// 		function (err, result, fields) 
// 		{
// 			if (err) console.log(err);
// 			result.forEach(async entry => 
// 			{
// 				let newCus = {};
				
// 				params.forEach(async item => 
// 				{
// 					if (entry[item]) newCus[item] = entry[item];
// 				});
// 				newCus.object_id = newCus.objectId;
// 				delete newCus.objectId;

// 				let obj = new object_catalogue(newCus);
// 				let response = await obj.save();
// 				console.log(response);
				
// 			})
// 		});
// 		console.log("DONE");
// });

// Get reservations
// con.connect(async function (err) {
// 	console.log(err);
// 	if (err) throw err;
// 	con.query("select distinct (SELECT sum(price) FROM mars_master_local.reservation_items ri where itemDefinitionId = 1 and ri.reservationId = r.id) total, " +
// 	"(SELECT distinct object_catalogue.objectId FROM mars_master_local.reservation_items " +
// 		"inner join unit on unit.id = reservation_items.unitId " +
// 		"inner join object_catalogue on object_catalogue.objectId = unit.objectId " +
// 		"where itemDefinitionId = 1 and reservation_items.reservationId = r.id limit 1) objectId, " +
// 		"r.*, r.id reservationId from reservation r " +
// 	"inner join v_tracking_details on v_tracking_details.reservationId = r.id",
// 		function (err, result, fields) 
// 		{
// 			if (err) console.log(err);
// 			result.forEach(async entry => 
// 			{
// 				let newCus = {};
				
// 				params.forEach(async item => 
// 				{
// 					if (entry[item]) newCus[item] = entry[item];
// 				});
				
// 				let obj = new reservation(newCus);
// 				let response = await obj.save();
// 				console.log(response);
				
// 			})
// 		});
// 		console.log("DONE");
// });

// Get pricelist items
// con.connect(async function (err) {
// 	console.log(err);
// 	if (err) throw err;

// 	let objects = await object_catalogue.find();
// 	objects.forEach( object => {
// 		con.query(`select * from unit where unit.objectId = ${object.object_id} and unit.isActive = 'Yes' and unit.isDeleted = 'No'`,
// 			(err, result, field) => {
// 				if(result.length)
// 				{
// 					let unit = result[0];
// 					con.query(`SELECT distinct pi.* FROM mars_master_local.pricelist_item pi 
// 					inner join pricelist_availability pa on pa.partnerId = 1 and pa.pricelistId = pi.pricelistId 
// 					where pi.unitId = ${unit.id} and pi.itemDefinitionId = 1 and pi.dateFrom >= '2022-06-01'`,
// 					(iErr, items, iField) => {
// 						items.forEach(async item => {
// 							item.object_id = object.object_id;
// 							try {
// 								let pi = new pricelist(item)
// 								let res = await pi.save();
// 								console.log(res);
// 							} catch (error) {
// 								console.log(error);
// 							}

// 						})
// 					})
// 				}
// 			})
// 	})
// });

export default app;
