const { 
    getMessagesOfUserAndFollowings, 
    getMessagesOfUser, 
    messageCreate, 
    messageDelete, 
    messageContentEdition, 
    getMessageById, 
    editMessageReaction, 
    commentMessage, 
    findAllcommentsOfMessage, 
    getPageMessages, 
    getNumberOfMessages 
} = require("../queries/messageQueries");
// const multer = require('multer');
// const util = require('node:util');
const { configureUpload } = require('../../config/multerConfig');
const { findUserById } = require("../queries/userQueries");
const path = require('path')
const fs = require('fs');
const { validateTokenWithSecret } = require("../../config/csrfConfig");
require('dotenv').config();

const upload = configureUpload('messageFiles')


exports.redirectToUserProfile = async (req, res, next) => {       //if user come to /home, redirect to /home/ his id
    let message;
    try {
        const { user } = req;
        if (!user) {                  //but he have to be connected to access his profile, verify this
            message = "Vous devez être connecté pour accéder à l'application"
            return res.status(401).json({ message })
        }
        res.redirect(`${req.protocol}://${req.hostname}:${process.env.PORT || '3000'}${req.baseUrl}${req.url}${user._id}`)
    } catch (error) {
        console.log(error)
        message = "Erreur serveur"
        res.status(500).json({ message })
    }
}

exports.getUserandFollowingsMessages = async (req, res, next) => {
    let message;
    try {
        if (!req.isAuthenticated()) {
            message = "Vous devez être connecté pour continuer."
            return res.status(401).json({ message })
        }
        const { id } = req.params;
        const user = await findUserById(id);
        if (!user) {
            message = "Aucun utilisateur trouvé pour l'id donné"
            return res.status(404).json({ message })
        }
        user.local = {};
        let messages
        if (id === req.user._id) {        //if user get his profile, display his messages and the messages of the users he follow
            messages = await getMessagesOfUserAndFollowings(user);
        }
        else {                           //else, if he visit a profile, only display the messages of the user profile
            messages = await getMessagesOfUser(user)
        }
        res.json({ messages, user, auth: req.user })       //see extractUserFromToken in jwtConfig, the info that is stocked in user
    } catch (error) {
        if (error.path === '_id') {                           //error BSON cast to ObjectId failed
            message = "Aucun utilisateur trouvé pour l'id donné"
            return res.status(404).json({ message })
        }
        message = "Une erreur est survenu lors de la récupération de la liste des messages. Merci de réessayer plus tard."
        res.status(500).json({ message })

    }
}

exports.createMessage = [                   //define an array of middleware
    async (req, res, next) => {                    //the first is for verify the file and save i to req.file if no error
        let message;
        try {
            if (!req.isAuthenticated()) {
                message = "Vous devez être connecté pour continuer."
                return res.status(401).json({ message })
            }
            upload.single('image')(req, res, err => {
                if (err && err.code === "LIMIT_FILE_SIZE") {
                    message = "Le fichier est trop volumineux. La taille maximate autorisée est de 500Mb."
                    return res.status(400).json({ error: err, message })
                }
                else if (err && err.message === "type not allowed") {
                    message = "Le type de fichier envoyé est invalide."
                    return res.status(500).json({ error: err, message })
                }
                else if (err) {
                    console.log(err)
                    throw new Error('an error occured')
                };
                next();
            })
        } catch (error) {
            console.log(error);
            message = "Une erreur est survenue lors de l'import de l'image";
            return res.status(500).json({ error: "error", message });
        }
    },
    async (req, res, next) => {           //here we have access to req.file
        let message;
        try {
            const isValidToken = validateTokenWithSecret(process.env.TOKEN_SECRET, req.body.token)       //compare the signed cookie and the token from the form
            if (!isValidToken) {
                if (req.file) {
                    fs.unlink(path.join(__dirname, `../../../front/public/assets/messageFiles/${req.file.filename}`), (err) => {
                        if (err) throw err;
                        console.log(" message's file succefully deleted cause no token provided")
                    })
                }
                message = "Token invalide. Veuillez vous reconnecter à l'application pour en générer un nouveau"
                return res.status(403).json({ message, error: 'Erreur token' })
            }
            const id = req.user._id;
            const content = req.body.content;
            const filename = req.file?.filename || null;
            if (filename == null && content == '') {
                message = "le message ne comporte aucun contenu"
                return res.status(404).json({ message })
            }
            await messageCreate(id, content, filename)
            message = "Votre message à bien été enregistré."
            res.json({ message })
        } catch (error) {
            console.log(error)
            message = "Erreur lors de l'enregistrement de votre message";
            res.status(500).json({ error: "error", message })
        }
    }
];

exports.deleteMessage = async (req, res, next) => {
    let message;
    try {
        if (!req.isAuthenticated()) {
            message = "Vous devez être connecté pour continuer."
            return res.status(401).json({ message, error: 'not authenticated' })
        }
        const isValidToken = validateTokenWithSecret(process.env.TOKEN_SECRET, req.body.token)       //compare the signed cookie and the token from the form
        if (!isValidToken) {
            message = 'Token invalide'
            return res.status(403).json({ message, error: 'Erreur token' })
        }
        const { id } = req.params;
        const deletedMessage = await messageDelete(id);
        if (deletedMessage.file) {
            fs.unlink(path.join(__dirname, `../../../front/public/assets/messageFiles/${deletedMessage.file}`), (err) => {
                if (err) throw err;
                console.log(" message's file succefully deleted")
            })
        }
        message = 'Le message à bien été supprimé'
        res.json({ message, id })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error })
    }
}

exports.editMessage = async (req, res, next) => {
    let message;
    try {
        if (!req.isAuthenticated) {
            message = "Vous devez être connecté pour continuer.";
            return res.status(401).json({ message })
        }
        const isValidToken = validateTokenWithSecret(process.env.TOKEN_SECRET, req.body.token)       //compare the signed cookie and the token from the form
        if (!isValidToken) {
            message = 'Token invalide'
            return res.status(403).json({ message, error: 'Erreur token' })
        }
        const { id } = req.params;
        const { newContent } = req.body;
        const messageUpdates = await messageContentEdition(id, newContent)
        message = "Message modifié avec succès."
        res.json({ message, newContent })
    } catch (error) {
        console.log(error)
        message = "Erreur lors de la modification du message"
        res.status(500).json({ message })
    }
}

exports.userReactToMessage = async (req, res, next) => {
    let message;
    try {
        if (!req.isAuthenticated) {
            message = "Vous devez être connecté pour continuer.";
            return res.status(401).json({ message });
        }
        const user = req.user;
        const { id, reaction } = req.params;
        const editedMessageReaction = await editMessageReaction(id, user, reaction)
        message = "Votre reaction à été ajoutée à ce message."
        res.json({ message, likes: editedMessageReaction.liked.length, dislikes: editedMessageReaction.disliked.length })
    } catch (error) {
        console.log(error)
        message = "Une erreur est survenu."
        res.status(500).json({ message })
    }
}

exports.postComment = async (req, res, next) => {
    let message;
    try {
        if (!req.isAuthenticated()) {
            message = "Vous devez être connecté pour continuer.";
            return res.status(401).json({ message });
        }
        const isValidToken = validateTokenWithSecret(process.env.TOKEN_SECRET, req.body.token)       //compare the signed cookie and the token from the form
        if (!isValidToken) {
            message = 'Token invalide'
            return res.status(403).json({ message, error: 'Erreur token' })
        }
        const { user } = req;
        const { id } = req.params;
        const { content } = req.body;
        const editedMessage = await commentMessage(id, user, content);
        message = "votre commentaire à été ajouté à la liste des commentaires de ce message";
        res.json({ message, comment: editedMessage })
    } catch (error) {
        console.log(error)
        message = "Erreur lors de l'enregistrement de votre message";
        res.status(500).json({ message })
    }
}

exports.getMessageComments = async (req, res, next) => {
    let message;
    try {
        const { id } = req.params;
        const messageComments = await findAllcommentsOfMessage(id);
        message = "les commentaires ont bien été récupérés";
        res.json({ message, comments: messageComments.comments })
    } catch (error) {
        console.log(error)
        message = "Erreur lors de la récupération des commentaires";
        res.status(500).json({ message })
    }
}

exports.displayMessagesPage = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page);
        console.log('page:', page)
        const pageSize = 2; // Nombre de messages par page
        const [messages, totalDocuments] = await Promise.all([
            getPageMessages(page, pageSize),
            getNumberOfMessages()
        ])
        const nextPage = (page + 1) * pageSize < totalDocuments ? page + 1 : null;
        res.json({messages, nextPage});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des messages.' });
    }
}