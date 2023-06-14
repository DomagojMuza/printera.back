
const mongoose = require('mongoose');

mongoose.set('strictQuery', true);
mongoose.connect( 'mongodb+srv://domim1998:jasamzakon98@bookistra.xakpyv4.mongodb.net/?retryWrites=true&w=majority')
.then(() => console.log( 'Database Connected' ))
.catch(err => console.log( err ));
