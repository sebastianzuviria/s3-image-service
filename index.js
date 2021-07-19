require('dotenv').config()
const express = require('express')
const imageServices = require('./services/amazonS3/imageServices')

const app = express()
const port = 3000

/////////
app.use(json())

//------EXAMPLE TO USE AMAZON S3 SERVICES TO UPLOAD AND DELETE IMAGE------
//

  app.post('/images', imageServices.uploadMiddleware, async (req, res) => {
    console.log(req.body)
    console.log(req.file)
    try{
      const urlOfImage = await imageServices.uploadImage(req.file)
      console.log(urlOfImage)
      res.status(200).send(urlOfImage)
    } catch (error) {
      res.status(500).json(error)
    }
  })

  app.delete('/images', async (req, res) => {
    console.log(req.body)
    try {
      await imageServices.deleteImage(req.body.url)
      res.status(204).end()
    } catch (error) {
      res.status(500).json(error)
    }
  })

app.listen(port, () => {
    console.log(`Server is running on ${port}`)
})