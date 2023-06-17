const router = require('express').Router();
const apiRoute = require('./api/apiRoutes');

router.use('/api', apiRoute)

// router.get('/', (req, res, next) =>{
//     res.send('hello localhost 3000!')
// })

module.exports = router;