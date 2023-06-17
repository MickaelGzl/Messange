const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const favicon = require('serve-favicon');
require('dotenv').config();
require('./src/db');
const routing = require('./src/routes');
const {extractUserFromToken, addJwtFeatures} = require('./config/jwtConfig');
const { createCsrfSecret } = require("./config/csrfConfig");


const app = express();

require('./config/socketConfig')
process.env.TOKEN_SECRET = createCsrfSecret()

// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'pug');
// app.use(express.static(path.join(__dirname, '/public'))) 

app
    .use(favicon(path.join(__dirname, 'public/assets/favicon.ico')))
    .use(cors({
        origin: ["http://localhost:5173", "http://192.168.1.10:5173"],
        credentials: true
    }))
    .use(express.json({limit: '200KB'}))                // for json data form
    .use(express.urlencoded({extended: true}))          // for encoded / multipart form data   
    .use(cookieParser(process.env.COOKIE_SECRET_KEY))         // create a secret key for sign cookies, to protect them to be changed by users
    .use(extractUserFromToken)
    .use(addJwtFeatures)
    .use(routing)

const port = process.env.PORT || 3000;

app.listen(port, ()=>{
    console.log(`app listen on port ${port}`)
})

//exec have a better stack trace
//return a thenable (funciton that have a then), exec return a promise
//unlike a promise, calling a .then queries can execute the querie multiple times
