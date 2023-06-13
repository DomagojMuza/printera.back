
const mongoose = require('mongoose');

mongoose.set('strictQuery', true);
mongoose.connect( 'mongodb://127.0.0.1:27017/bookistra')
.then(() => console.log( 'Database Connected' ))
.catch(err => console.log( err ));