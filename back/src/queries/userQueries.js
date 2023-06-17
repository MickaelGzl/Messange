const { User } = require('../db/models')


exports.createUser = async (email, password) =>{
    try {
        const hashedPassword = await User.hashPassword(password)
        const user = new User({
            local: {
                email: email,
                password: hashedPassword
            }
        })
        return user.save()
    } catch (error) {
        console.log(error)
        throw new Error;
    }
}

exports.findUserByMail = (email) =>{
    return User.findOne({'local.email': email}).exec() || null
}

exports.findUserById = (id) =>{
    return User.findById(id).exec() || null;
}

exports.modifyUsername = async(id, username) =>{
    const user = await User.findByIdAndUpdate(id, {$set: {username: username}});
    return user.save();
}

exports.findUserByUsername = (search) =>{
    const regExp = new RegExp(`${search}`, 'i')
    return User.find({username: {$regex: regExp}}).select('-local').exec();
}

exports.avatarUpdate = async(id, avatarFileName) =>{
    const user = await User.findByIdAndUpdate(id, {$set: {avatar: avatarFileName}})
    return user.save();
}

exports.modifyFollowingsUser = async(auth, userId, value) =>{
    if(value === 'follow'){
        const user = await User.findByIdAndUpdate(auth._id, {$set: {followings: [...auth.followings, userId]}})
        return user.save();
    }
    else if(value === "unfollow"){
        const removeConcernedUserId = auth.followings.filter(followingId => followingId.toString() !== userId.toString())
        const user = await User.findByIdAndUpdate(auth._id, {$set: {followings: [...removeConcernedUserId]}});
        return user.save() 
    }
}

exports.findAllUsers = () =>{
    return User.find({}).select('-local').exec();
}

exports.hashThePassword = (password) =>{
    return User.hashPassword(password);
}