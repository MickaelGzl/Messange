const router = require('express').Router();
const { getUserandFollowingsMessages, createMessage, deleteMessage, editMessage, redirectToUserProfile, userReactToMessage, postComment, getMessageComments, displayMessagesPage } = require('../../controller/messageController');

router.get('/', redirectToUserProfile)

router.get('/display', displayMessagesPage)

router.get('/view/:id', getMessageComments)
router.get('/:id', getUserandFollowingsMessages)

router.post('/create', [createMessage])
router.post('/edit_comment/:id', postComment)

router.put('/edit/:id', editMessage)
router.put('/:id/:reaction', userReactToMessage)

router.delete('/delete/:id', deleteMessage)



module.exports = router;