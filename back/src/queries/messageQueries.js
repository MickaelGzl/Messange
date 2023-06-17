const { Message, Comment } = require("../db/models")


exports.getMessageById = (id) =>{
    return Message.findById(id)
}

//here we gonna take the user, find all messages that was whote by him or by followed users
// then we populate author to get the information of the user with the message
//and we sort the list by update date desc
//finally we transform this request into a promise
// the author has to be in following or in the id of the user
//Also, we don't get the comments of all the messages for display them. It's useless and it's to much informations
exports.getMessagesOfUserAndFollowings = (user) =>{
    return Message.find({author: {$in: [...user.followings, user._id ]}}).populate('author').sort({createdAt: -1}).select('-comments').exec();
}

exports.getMessagesOfUser = (user) =>{
    return Message.find({author: user._id}).populate('author').sort({createdAt: -1}).select('-comments').exec();
}

exports.messageCreate = (id, content, filename) =>{
    const escapedContent = content.replace(/[.*+?^${}()|[\]<>/]/g, '\\$&')
    const newMessage = new Message({
        content: escapedContent,
        file: filename,
        author: id
    })
    return newMessage.save();
}

exports.messageDelete = (id) =>{
    return Message.findByIdAndDelete(id).exec();
}

exports.messageContentEdition = async(id, newContent) =>{
    const message = await Message.findByIdAndUpdate(id, {$set: {content: newContent}});
    return message.save();
}

exports.editMessageReaction = async(id, user, reaction) =>{
    try {
        const message = await Message.findById(id);
        // console.log({reaction})
        if(reaction === "like"){                   //if the user click to the like button
            const userHaveDislikeBefore = message.disliked.filter(userId => userId.toString() === user._id.toString())
            if(userHaveDislikeBefore.length > 0){
                message.disliked = message.disliked.filter(userId => userId.toString() !== user._id.toString())
            }
            
            const userAlreadyLike = message.liked.filter(userId => userId.toString() === user._id.toString())   //have the user already liked this message ?
            if(userAlreadyLike.length === 0){       //no, the user haven't like yet
                message.liked = [...message.liked, user._id];
                return message.save()
            }
            else{                       //yes, the user already like this message
                const newLikes = message.liked.filter(userId => userId.toString() !==user._id.toString())   //remove it from the users who liked
                message.liked = newLikes;
                return message.save()
            }
        }
        else if(reaction === "dislike"){   //same treatement as before un the disliked array
            const userHaveLikeBefore = message.liked.filter(userId => userId.toString() === user._id.toString())
            if(userHaveLikeBefore.length > 0){
                message.liked = message.liked.filter(userId => userId.toString() !== user._id.toString())
            }
    
            const userAlreadyDislike = message.disliked.filter(userId => userId.toString() === user._id.toString())   //already disliked ?
            if(userAlreadyDislike.length === 0){       //no
                message.disliked = [...message.disliked, user._id];
                return message.save()
            }
            else{                       //yes
                const newDislikes = message.disliked.filter(userId => userId.toString() !==user._id.toString())   //search and remove
                message.disliked = newDislikes;
                return message.save()
            }
        }
        else{
            return;
        }
    } catch (error) {
        console.log(error)
        throw new Error(error)
    }  
}

exports.commentMessage = async(messageId, user, content) =>{
    try {
        const newComment = new Comment({
            author: user._id,
            content,
        })
        const commentSaved = await newComment.save();
        //now we define the comm, save it into our message (need new: true, otherwise the message is returned without the new comm)
        //by default, findByIdAndUpdate return the previous value, or we want the naw value with the new comm
        const message = await Message.findByIdAndUpdate(messageId, {$push: {comments: newComment}, $inc: {numberOfComments: 1}}, {new: true}).exec();
        await message.save();
        return Comment.findById(commentSaved._id).select({__v: 0, updatedAt: 0}).populate({path: 'author', select: ['id', 'avatar', 'username']}).exec()
    } catch (error) {
        throw new Error(error)
    }
}

exports.findAllcommentsOfMessage = (id) =>{
    return Message.findById(id).select({comments: 1, _id: 0,}).populate({path: 'comments.author', select: ['id', 'avatar', 'username']}).exec();    //do not send local (email, password, passwordToken) to front !
}

exports.getPageMessages = (page, pageSize) =>{
    return Message.find()
            .skip(page * pageSize) // Ignorer les messages des pages précédentes
            .limit(pageSize) // Limiter le nombre de messages par page
            .exec();
}

exports.getNumberOfMessages = () =>{
    return Message.countDocuments().exec()
}