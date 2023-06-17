const { createTokenFromSecret, validateTokenWithSecret } = require("../../config/csrfConfig")
require('dotenv').config()


exports.createCsrfAndSendToFront = async(req, res, next) =>{
    try {
        if(!req.isAuthenticated()){
            message = "Vous devez être connecté pour continuer."
            return res.status(401).json({message})
        }
        const token = createTokenFromSecret(process.env.TOKEN_SECRET)
    
        return res.json({token})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'Erreur', error})
    }
    
}

exports.verifyToken = async(req, res, next) =>{
    try {
        const token = req.body.serverToken
        if(!token){
            return res.status(401).json({message: 'invalid token'})
        }
        const isValidToken =  validateTokenWithSecret(process.env.TOKEN_SECRET, token)
        if(!isValidToken){
            return res.status(401).json({message: 'invalid token'})
        }
        return res.json({message: 'authorized'})
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}