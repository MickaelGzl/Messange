const router = require('express').Router();
const {userCreate, userLogIn, userLogOut, userIsAuthenticate, updateUserUsername, updateUserAvatar, updateUserFollowings, userList, passwordForgot, resetUserPassword} = require('../../controller/userController');


router.post('/inscription', userCreate);
router.post('/connection', userLogIn);
router.post('/forgot_password', passwordForgot)
router.post('/reset-password/:userId/:token', resetUserPassword)
router.get('/', userList)
router.get('/disconnection', userLogOut)
router.get('/isauthenticated', userIsAuthenticate)
router.put('/username', updateUserUsername)
router.put('/avatar', [updateUserAvatar])
router.put('/followings', updateUserFollowings)


module.exports = router;