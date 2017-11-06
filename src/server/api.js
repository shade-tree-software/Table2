import express from 'express'
import jwt from 'jsonwebtoken'
import pwHash from 'password-hash'
import bodyParser from 'body-parser'

export default function (db) {

  let api = express.Router()

  api.use(bodyParser.urlencoded({extended: false}))
  api.use(bodyParser.json())

  api.post('/authenticate', function (req, res) {
    let query = {username: req.body.username}
    db.collection('users').findOne(query).then(function (data) {
      if (data && pwHash.verify(req.body.password, data.password)) {
        let token = jwt.sign(query, process.env.SECRET)
        res.json({
          success: true,
          message: 'access granted',
          token: token
        })
      } else(
        res.sendStatus(404)
      )
    }).catch(function (err) {
      console.log(err.stack)
    })
  });

  api.use(function (req, res, next) {
    let token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
      jwt.verify(token, process.env.SECRET, function (err, decoded) {
        if (err) {
          return res.json({success: false, message: 'Failed to authenticate token.'});
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      return res.status(403).send({success: false, message: 'No token provided.'});
    }
  });

  return api
}