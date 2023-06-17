const router = require('express').Router();
const userRoute = require('./userRoutes');
const authRoutes = require('./authRoutes');
const messageRoutes = require('./messageRoutes');

router.use('/user', userRoute);
router.use('/auth', authRoutes);
router.use('/message', messageRoutes)

module.exports = router;