const AWS = require('aws-sdk')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
const allConfigs = require('../../config/config')

const config = {
    'production': allConfigs.production,
    'development': allConfigs.development,
    'test': allConfigs.test
}

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
})

//MIDDLEWARE TO SAVE IMAGE 

const uploadMiddleware = multer({ 
    storage: multer.memoryStorage({
        destination: (req, file, callback) => {
            callback(null, '')
        }
    })
}).single('image')

//-------------------------------------------------//

const uploadImage = async (file) => {
    const myFile = file.originalname.split('.')
    const fileType = myFile[myFile.length -1]

    if (file.mimetype.startsWith("image")){
        const params = {
            Bucket: process.env.BUCKET_NAME,
            ContentType: file.mimetype,
            Key: `${uuidv4()}.${fileType}`,
            Body: file.buffer,
            ACL: 'public-read'
        }

        return new Promise((resolve, reject) => s3.upload(params, (error, data) => {
            if (error) reject(error)
            else resolve(data.Location)
        }))
    } else {
        return new Promise((resolve, reject) => reject({ message: 'File is not an image' }))
    }
}

const deleteImage = (imageUrl) => {
    if(imageUrl && imageUrl?.startsWith(`https://${process.env.BUCKET_NAME}.s3.sa-east-1.amazonaws.com/`)){
        const urlSplited = imageUrl.split('/')
        const imageName = urlSplited[urlSplited.length - 1]

        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: imageName
        }

        return new Promise((resolve, reject) => s3.deleteObject(params, (error, data) => {
            if (error) reject(error)
            else resolve(data)
        }))
    } else {
        return new Promise((resolve, reject) => resolve({ message: 'Not image at amazon'}))
    }
}

const imageServices = {
    uploadImage,
    deleteImage,
    uploadMiddleware
}

module.exports = imageServices