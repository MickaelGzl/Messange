const multer = require('multer');
const path = require('path');

const authorizedMimeTypes = ['jpg', 'jpeg', 'jfif', 'png', 'svg', 'webp', 'bmp']       //define the authorides file mymetypes

function getDestination(whatIsFile){        //messageFiles or profile
    return (req, file, cb) => {
        cb(null, path.join(__dirname, `../../front/public/assets/${whatIsFile}`))
    }
}

const configureUpload = (whatIsFile) =>{
    return multer({
        storage: multer.diskStorage({
            filename: (req, file, cb) => {
                cb(null, `${Date.now()}_${file.originalname}`)              //for an unique name with the original extension
            },
            destination: getDestination(whatIsFile)
        }),
        limits: {
            fileSize: 512001 // en bytes = 500Ko //512001
        },
        fileFilter: (req, file, cb) => {
            if (!authorizedMimeTypes.includes(file.mimetype.split('/')[1])) {
                return cb(new Error('type not allowed'))
            }
            cb(null, true)
        }
    })
}

exports.configureUpload = configureUpload