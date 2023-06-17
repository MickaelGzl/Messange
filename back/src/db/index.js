const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
.then(async() =>{
    console.log('connection ok')

    
    
})
.catch(err => console.log(`Error: ${err}`))