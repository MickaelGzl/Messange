const router = require('express').Router();
const { createCsrfAndSendToFront, verifyToken } = require('../../controller/authController');


router.get('/csrf-token', createCsrfAndSendToFront)
router.post('/verify-token', verifyToken)


module.exports = router;