import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import bodyParser from 'body-parser'
import assert from 'assert'
import mongodb from 'mongodb'

export default function (db) {

  let api = express.Router()

  api.use(bodyParser.urlencoded({extended: false}))
  api.use(bodyParser.json())

  // Get authentication token
  api.post('/authenticate', function (req, res) {
    let filter = {username: req.body.username}
    db.collection('users').findOne(filter).then(function (data) {
      if (data && bcrypt.compareSync(req.body.password, data.password)) {
        let token = jwt.sign({userId: data._id}, process.env.SECRET)
        res.json({
          success: true,
          message: 'access granted',
          token: token
        })
      } else (
        res.sendStatus(404)
      )
    }).catch(function (err) {
      console.log(err.stack)
    })
  });

  // Validate authentication token
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

  api.route('/tables')
  // Get all table names for the specified user
    .get(function (req, res) {
      db.collection('tables').find(
        {userId: req.decoded.userId},
        {tableName: true}).toArray(function (err, result) {
        res.send(result)
      })
    })
    // Insert a new table for the specified user
    .post(function (req, res) {
      let table = {tableName: req.body.tableName, userId: req.decoded.userId}
      db.collection('tables').insertOne(table).then(function () {
        res.sendStatus(200)
      }).catch(function (err) {
        console.log(err.stack)
      })
    })

  api.route('/tables/:_id')
  // Get the complete contents of a specific table
    .get(function (req, res) {
      let filter = {_id: new mongodb.ObjectID(req.params._id)}
      db.collection('tables').findOne(filter).then(function (table) {
        let rowIds = table.rows.map((row) => ( row.rowId ))
        db.collection('cells').find({rowId: {$in: rowIds}}).toArray().then(function (cells) {
          console.log(JSON.stringify(cells))
          res.send({
            rows: table.rows, columns: table.columns || [], cells, tableName: table.tableName, tableId: table._id
          })
        }).catch(function (err) {
          console.log(err.stack)
        })
      }).catch(function (err) {
        console.log(err.stack)
      })
    })
    // Set the value of a particular field in a table
    .put(function (req, res) {
      let filter = {_id: new mongodb.ObjectID(req.params._id)}
      let update = {$set: {[req.body.name]: req.body.value}}
      db.collection('tables').updateOne(filter, update).then(function () {
        res.sendStatus(200)
      }).catch(function (err) {
        console.log(err.stack)
      })
    })
    // Delete a table
    .delete(function (req, res) {
      let filter = {_id: new mongodb.ObjectID(req.params._id)}
      db.collection('tables').deleteOne(filter).then(function () {
        res.sendStatus(200)
      }).catch(function (err) {
        console.log(err.stack)
      })
    })

  api.route('/tables/:_id/columns')
  // Add or insert a new column into a table
    .post(function (req, res) {
      let filter = {_id: new mongodb.ObjectID(req.params._id)}
      let update
      if (req.body.position) {
        let position = parseInt(req.body.position)
        update = {$push: {columns: {$each: [{columnName: req.body.columnName}], $position: position}}}
      } else {
        update = {$push: {columns: {columnName: req.body.columnName}}}
      }
      db.collection('tables').updateOne(filter, update).then(function () {
        res.sendStatus(200)
      }).catch(function (err) {
        console.log(err.stack)
      })
    })

  api.route('/tables/:_id/rows')
  // Add a new row to a table
    .post(function (req, res) {
      let filter = {_id: new mongodb.ObjectID(req.params._id)}
      let rowId = new mongodb.ObjectId()
      let update = {$push: {rows: {rowId}}}
      db.collection('tables').updateOne(filter, update).then(function () {
        res.send({rowId})
      }).catch(function (err) {
        console.log(err.stack)
      })
    })

  api.route('/tables/:tableId/rows/:rowId')
  // Set the value of a table cell
    .put(function (req, res) {
      let filter = {rowId: new mongodb.ObjectID(req.params.rowId), columnName: req.body.columnName}
      let update = {
        rowId: new mongodb.ObjectID(req.params.rowId),
        columnName: req.body.columnName,
        value: req.body.cellValue
      }
      db.collection('cells').updateOne(filter, update, {upsert: true}).then(function (r) {
        res.send({cellId: r.upsertedId._id})
      }).catch(function (err) {
        console.log(err.stack)
      })
    })
    // Delete a row
    .delete(function (req, res) {
      let filter = {_id: new mongodb.ObjectID(req.params.tableId)}
      let update = {$pull: {rows: {rowId: new mongodb.ObjectID(req.params.rowId)}}}
      db.collection('tables').updateOne(filter, update).then(function () {
        filter = {rowId: new mongodb.ObjectID(req.params.rowId)}
        db.collection('cells').deleteMany(filter).then(function () {
          res.sendStatus(200)
        }).catch(function (err) {
          console.log(err.stack)
        })
      }).catch(function (err) {
        console.log(err.stack)
      })
    })

  api.route('/tables/:_id/columns/:columnName')
  // Delete a column
    .delete(function (req, res) {
      let filter = {_id: new mongodb.ObjectID(req.params._id)}
      let update = {$pull: {columns: {columnName: req.params.columnName}}}
      db.collection('tables').updateOne(filter, update).then(function () {
        filter = {columnName: req.params.columnName}
        db.collection('cells').deleteMany(filter).then(function () {
          res.sendStatus(200)
        }).catch(function (err) {
          console.log(err.stack)
        })
      }).catch(function (err) {
        console.log(err.stack)
      })
    })
  return api
}