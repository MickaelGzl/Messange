const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: [true, "Mais comment un commentaire qui n'est écrit par personne peut t'il exister ?"]
    },
    content: {
        type: String,
        maxLength: [248, "Votre message est trop long (jusqu'à 248 caractères max autorisés)."]
    },
    liked: {type: [Schema.Types.ObjectId], ref: 'user'},
    disliked: {type: [Schema.Types.ObjectId], ref: 'user'}
},{
    timestamps: true
})

const Comment = mongoose.model(`comment`, commentSchema)          

module.exports = {Comment, commentSchema}
