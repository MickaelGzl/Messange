const { createUser, findUserByMail, findUserById, modifyUsername, findUserByUsername, avatarUpdate, modifyFollowingsUser, findAllUsers, hashThePassword } = require('../queries/userQueries');
// const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {v4: uuidv4} = require('uuid');
const { configureUpload } = require('../../config/multerConfig');
const emailFactory = require('../emails');
const { sanitizeFilter } = require('mongoose');
const User = require('../db/models/userModel');
const { createTokenFromSecret } = require('../../config/csrfConfig');
require('dotenv').config()

const upload = configureUpload('profile')


exports.userCreate = async (req, res, next) => {             
    let message;
    try {
        sanitizeFilter(req.body)
        const { email, password } = req.body;                         //destructuring body to have more easily email and password
        const existingMail = await findUserByMail(email)            //first, verify if email is valid (not already in use)
        if (existingMail) {
            message = "Cet email est déjà associé à un utilisateur."
            return res.status(400).json({ message, underInput: true })
        }

        const user = await createUser(email, password)

        message = "Votre enregistrement à été effectué avec succès."
        return res.json({ message, user, body: req.body})


    } catch (error) {
        console.log(error)
        message = "Erreur lors de l'enregistrement. Merci de réessayer dans quelques instants."
        res.status(500).json({ message })
    }
}

exports.userLogIn = async (req, res, next) => {
    let message;
    try {
        // console.log(req.body)
        // sanitizeFilter(req.body)
        // console.log(req.body)
        const { email, password } = req.body;
        const user = await findUserByMail(email)
        if (!user) {
            message = "Identifiant ou mot de passe incorrect."
            return res.status(404).json({ message })
        }
        const matchPasswords = await user.comparePasswords(password)
        if (!matchPasswords) {
            message = "Identifiant ou mot de passe incorrect."
            return res.status(404).json({ message })
        }

        req.login(user)
        const userSendToFront = { ...user._doc, local: {} }     //reset local to empty, to not send email and password to front
        message = `Bonjour, ${user.username || ''}`
        res.json({ message, user: userSendToFront })

    } catch (error) {
        console.log(error)
        message = "Tentative de connexion échouée. Merci de réessayer dans quelques instants."
        res.status(500).json({ message })
    }
}

exports.userLogOut = async (req, res, next) => {
    let message;
    try {
        req.logout();
        message = "Déconnexion réussi."
        res.json({ message })
    } catch (error) {
        message = "Erreur lors de la déconnection de votre compte",
            res.status(500).json({ message })
    }
}

exports.userIsAuthenticate = (req, res, next) => {
    try {
        if (!req.user) {
            return res.json({ isAuthenticated: false })
        }
        res.json({ user: req.user, isAuthenticated: true })
    } catch (error) {
        console.log(error)
        const message = "Une erreur est survenue."
        res.status(500).json({ message })
    }
}

exports.updateUserUsername = async (req, res, next) => {
    let message;
    try {
        if(!req.isAuthenticated()){
            message = "Vous devez être connecté pour continuer"
            return res.status(401).json({message})
        }
        const { id, username } = req.body;            
        await modifyUsername(id, username);
        message = "Pseudo modifié avec succès"
        res.json({ message, username })

    } catch (error) {
        console.log(error)
        message = "Erreur lors de la modification du pseudo"
        res.status(500).json({ message })
    }
};

exports.updateUserAvatar = [
    async (req, res, next) => {
        let message;
        try {
            if(!req.isAuthenticated()){
                message = "Vous devez être connecté pour continuer."
                return res.status(401).json({message})
            }
            upload.single('avatar')(req, res, err => {
                if (err && err.code === "LIMIT_FILE_SIZE") {
                    message = "Le fichier est trop volumineux. La taille maximate autorisée est de 500Mb."
                    return res.status(400).json({ error: err, message })
                }
                else if (err && err.message === "type not allowed") {
                    message = "Le type de fichier envoyé est invalide."
                    return res.status(500).json({ error: err, message })
                }
                else if (err) {
                    throw new Error(err)
                };
                next();
            })
        } catch (error) {
            console.log(error);
            message = "Une erreur est survenue lors de l'import de l'image";
            return res.status(500).json({ error: "error", message });
        }
    },
    async (req, res, next) => {
        try {
            const id = req.user._id;
            const filename = req.file.filename;
            const avatar = req.user.avatar;

            await avatarUpdate(id, filename)

            // const appliAvatars = ['profil_pic0.jpg', 'profil_pic1.jpg', 'profil_pic2.jpg', 'profil_pic3.jpg', 'profil_pic4.jpg']
            if(avatar.substring(0, 1) !== 'p'){
                fs.unlink(path.join(__dirname, `../../../front/public/assets/profile/${avatar}`), (err) =>{     //suppress the previous avatar of the user if it's not an avatar provide by the app
                    if(err) throw err;
                    console.log('previous avatar succefully deleted')       //like they have a timestamps in their name they are all differents (impossible to be used  twice in 2 locations)
                })
            }
            message = "Avatar modifié avec succés."
            res.json({ message, filename })         //send filename to front for a direct update
        } catch (error) {
            message = "Erreur lors de la modification de votre avatar";
            res.status(500).json({ error: "error", message })
        }
    }
];

exports.updateUserFollowings = async(req, res, next) =>{
    let message;
    try {
        if(!req.isAuthenticated()){
            message = "Vous devez être connecté pour continuer."
            return res.status(401).json({message})
        }
        const {userId, value} = req.body;
        const auth = req.user;
        await modifyFollowingsUser(auth, userId, value)       //the user, the user that is 'value' (follow or unfollow)
        if(value === "follow"){
            message = `Vous suivez maintenant cet utilisateur`
        }
        else if(value === 'unfollow'){
            message = "Vous ne suivez plus cet utilisateur"
        }
        res.json({message, value})
    } catch (error) {
        console.log(error)
        message = "Erreur lors de l'actualisation de votre liste d'utilisateur suivis."
        res.status(500).json({message})
    }
}

exports.userList = async (req, res, next) => {
    let message;
    try {
        let users;
        if(req.query.search){
            const regex = /[.*+?^${}()|[\]<>]/g
            const search = req.query.search.replace(regex, '');
            users = await findUserByUsername(search);
        }
        else{
            
            users = await findAllUsers();
        }
        res.json({ users })
    } catch (error) {
        console.log(error)
        message = "echec lors de la récupéraiton de la liste des utilisateurs."
        res.status(500).json({message})
    }
}

exports.passwordForgot = async(req, res, next) =>{
    let message;
    try {
        const {mail} = req.body;
        if(!mail){                         //be sure a mail is received
            const message = "Aucun email transmis dans la requête"
            return res.status(404).json({message})
        }
        let user = await findUserByMail(mail);
        if(!user){                          //if no user corresponding to the mail, 
            return res.end()
        }
        user.local.passwordToken = uuidv4();
        user.local.passwordTokenExpirationDate = Date.now() + 1000 * 60 * 30        //set an expiration after 30min
        await user.save() 
        const token = createTokenFromSecret(process.env.TOKEN_SECRET)
        
        console.log('jusque la ça se passe bien')
        emailFactory.sendResetPasswordLink({
            to: mail,
            url: req.headers.origin,
            userId: user._id,
            token: user.local.passwordToken,
            serverToken: token
        })
        res.end()
    } catch (error) {
        console.log(error)
        message = "Erreur lors de l'envoi du mail de réinitialisation."
        res.status(500).json({message})
    }
}

exports.resetUserPassword = async(req, res, next) =>{
    let message;
    try {
        const {userId, token} = req.params;
        const {newPassword} = req.body;
        if(!newPassword){
            message = "Aucun nouveau mot de passe renseigné."
            return res.status(404).json({message})
        }

        const user = await findUserById(userId);
        if(!user){
            message = "Impossible de modifier votre mot de passe"
        }
        if(user.local.passwordToken !== token || Date.now() > user.local.passwordTokenExpirationDate){
            message = "le token fournit est invalide. Il est possible qu'il soit expiré.";
        }
        if(message){
            return res.status(404).json({message})
        }
        //user has been found, a new password is set, and the token is corresponding to the user, and it's valid, so let's continue
        //modify the user's password, and set his password token and it's expiration date to null because it's not needed anymore
        user.local.passwordToken = null;
        user.local.passwordTokenExpirationDate = null
        user.local.password = await hashThePassword(newPassword);
        await user.save();
        message = 'Votre mot de passe à été modifié avec succès. Vous pouvez des à présent vous reconnecter sur Messange avec votre nouveau mot de passe'
        return res.json({message})
    } catch (error) {
        console.log(error)
        message = "Erreur lors de la modification du mot de passe"
        res.status(500).json({message})
    }
}