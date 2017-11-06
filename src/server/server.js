import express from 'express'
import mongodb from 'mongodb'

let runApp = function (db) {
  const app = express()
  app.use(express.static('build'))

  app.get('/*', function (req, res) {
    res.sendFile('index.html', {root: __dirname})
  })

  let port = process.env.PORT || 9000
  app.listen(port, function () {
    console.log(`Listening on port ${port}`)
  })
}

mongodb.MongoClient.connect(process.env.MONGODB_URL).then(runApp)