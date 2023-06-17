const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {commentSchema} = require('./commentModel')

const messageSchema = Schema({
    content: {
        type: String,
        maxLength: [512, "Votre message est trop long (jusqu'à 512 caractères max autorisés)."]
    },
    file: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: [true, "Mais comment un message qui n'est écrit par personne peut t'il exister ?"]
    },
    tags: {type: [String]},
    liked: {type: [Schema.Types.ObjectId], ref: 'user'},
    disliked: {type: [Schema.Types.ObjectId], ref: 'user'},
    numberOfComments: {type: Number, default: 0},
    comments: {type: [commentSchema]}
},{
    timestamps: true
})

const Message = mongoose.model(`message`, messageSchema)          

module.exports = Message