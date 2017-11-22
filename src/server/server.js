import express from 'express'
import mongodb from 'mongodb'
import initApi from './api'

let runApp = function (db) {
  const app = express()

  app.use(function (req, res, next) {
    if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
      res.redirect(302, 'https://' + req.hostname + req.originalUrl);
    } else {
      next();
    }
  })

  app.use(express.static('build'))

  let api = initApi(db)
  app.use('/api', api)

  app.get('/*', function (req, res) {
    console.log('index')
    res.sendFile('index.html', {root: __dirname})
  })

  let port = process.env.PORT || 9000
  app.listen(port, function () {
    console.log(`Listening on port ${port}`)
  })
}

mongodb.MongoClient.connect(process.env.MONGODB_URL).then(runApp)