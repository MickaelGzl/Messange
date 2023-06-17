const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');       //need this to hash password

const authorizeModification = [
    {
        validator: function(value){                     //do not authorize any modification except for passwords while password token is active
            if(this.local.passwordToken !== null){
                return false
            }
            return true
        }
    }
]


const userSchema = Schema({
    local: { 
        email: {
            type: String,
            required: [true, "L'email est obligatoire pour vous identifier" ],
            unique: true,
            // validate: [...authorizeModification]
        },
        password: {
            type: String, 
            required: [true, "Vous devez créer un mot de passe pour sécuriser votre compte"]
        },
        passwordToken: {type: String},
        passwordTokenExpirationDate: {type: Number},
        googleId: {
            type: String,
            // validate: [...authorizeModification]
        }
    },
    username: {
        type: String,
        maxLenght: [20, 'Votre pseudo ne peut aps dépasser 20 caractères'],
        // validate: [...authorizeModification]
    },
    description: {
        type: String,
        maxLenght: [512, 'Votre description ne peut pas dépasser 512 caractères'],
        validate: [...authorizeModification]
    },
    avatar: {
        type: String, 
        default: `profil_pic${Math.floor(Math.random() * 5)}.jpg`,     //use a default avatar for the profile, who can be edit later
        // validate: [...authorizeModification]
    },
    followings: {type: [Schema.Types.ObjectId], ref: 'user'}                //initialize an array of following users, who will contains id of this users
},{
    timestamps: true
})

// userSchema.pre('validate', function(next){  
//     try {
//         if(this.local.passwordToken !== null){
//             throw new Error("Can not modify while passwordToken active")
//         }
//         next();
//     } catch (error) {
//         console.log(error)
//         next(error)
//     }                                              
// })   

userSchema.statics.hashPassword = async (pass) =>{      //create a static function to hash user's password
    try {                                     
        return bcrypt.hash(pass, 12)            // hash the password with a salt of 10(default)
    } catch (error) {
        throw error
    }
}

userSchema.methods.comparePasswords = function(pass){   //also edit this function, for compare the hashed password to a new hashed string
    return bcrypt.compare(pass, this.local.password)    //same strings always have same hash, but we can't decode a hash
}

const User = mongoose.model(`user`, userSchema)          

module.exports = User