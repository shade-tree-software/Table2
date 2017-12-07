import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import bodyParser from 'body-parser'
import mongodb from 'mongodb'
import Crypt from './Crypt'
import co from 'co'
import version from 'project-version'
import DBFuncs from './DBFuncs'

export default function (db) {

  let api = express.Router()
  let dbFuncs = new DBFuncs(db)

  api.use(bodyParser.urlencoded({extended: false}))
  api.use(bodyParser.json())
  api.use(bodyParser.text())

  function onError(err) {
    console.log(err.stack)
  }

  // Get authentication token
  api.post('/authenticate', function (req, res) {
    let filter = {username: req.body.username}
    db.collection('users').findOne(filter).then(function (data) {
      if (data && bcrypt.compareSync(req.body.password, data.password)) {
        let token = jwt.sign({userId: data._id}, process.env.ENCRYPTION_KEY)
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
      jwt.verify(token, process.env.ENCRYPTION_KEY, function (err, decoded) {
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

  api.route('/version')
    .get(function (req, res) {
      res.send({version})
    })

  let getCSVColumnNames = (csvFile) => {
    return new Promise((fulfill, reject) => {
      let lines = csvFile.split('\n')
      if (lines.length > 0) {
        let columnNames = lines[0].split(',')
        fulfill(columnNames)
      } else {
        reject(new Error('CSV file seems to be empty'))
      }
    })
  }

  let getCSVCellData = (csvFile, colIds) => {
    let cellDataByRow = []
    let lines = csvFile.split('\n')
    if (lines.length > 1) {
      for (let rowIndex = 1; rowIndex < lines.length; rowIndex++) {
        let cellValues = lines[rowIndex].split(/,(?! )/)
        if (cellValues.length === Object.keys(colIds).length) {
          let cellData = []
          for (let cellIndex = 0; cellIndex < cellValues.length; cellIndex++) {
            cellData.push({value: cellValues[cellIndex], colId: colIds[cellIndex]})
          }
          cellDataByRow.push(cellData)
        }
      }
    }
    if (cellDataByRow.length === 0) {
      throw new Error('CSV file contains no valid rows')
    }
    return cellDataByRow
  }

  api.route('/tables/:tableId/csv')
  // Upload a csv file
    .post(function (req, res) {
      co(function* () {
        let csv = req.body.replace(/["\r]/g, '')
        let columnNames = yield getCSVColumnNames(csv)
        let colIds = yield dbFuncs.addColumns(req.params.tableId, columnNames)
        let cellData = getCSVCellData(csv, colIds)
        yield dbFuncs.addRowsWithCellData(req.params.tableId, cellData)
        let tableDetails = yield dbFuncs.getTableDetails(req.params.tableId)
        res.send(tableDetails)
      }).catch((err) => {
        res.status(400).send(err.message)
      })
    })

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

  api.route('/tables/:tableId')
  // Get the complete contents of a specific table
    .get(function (req, res) {
      dbFuncs.getTableDetails(req.params.tableId).then((tableDetails) => {
        res.send(tableDetails)
      }).catch(onError);
    })
    // Set the value of a particular field in a top-level 'table' document
    .put(function (req, res) {
      let filter = {_id: new mongodb.ObjectID(req.params.tableId)}
      let update = {$set: req.body.values}
      db.collection('tables').updateOne(filter, update).then(function () {
        res.sendStatus(200)
      }).catch(onError)
    })
    // Delete a table
    // NOT USED
    // TODO: add delete table option on GUI and delete corresponding cells when deleting table
    .delete(function (req, res) {
      let filter = {_id: new mongodb.ObjectID(req.params.tableId)}
      db.collection('tables').deleteOne(filter).then(function () {
        res.sendStatus(200)
      }).catch(onError)
    })

  api.route('/tables/:tableId/columns')
  // Add or insert a new column into a table
    .post((req, res) => {
      dbFuncs.addColumn(req.params.tableId, req.body.columnName, req.body.position).then((columnId) => {
        res.send({columnId})
      }).catch(onError)
    })

  api.route('/tables/:tableId/rows')
  // Add a new row to a table
    .post((req, res) => {
      dbFuncs.addRow(req.params.tableId).then((rowId) => {
        res.send({rowId})
      }).catch(onError)
    })

  api.route('/tables/:tableId/rows/:rowId')
  // Delete a row
    .delete(function (req, res) {
      co(function* () {
        let filter = {_id: new mongodb.ObjectID(req.params.tableId)}
        let update = {$pull: {rows: {rowId: new mongodb.ObjectID(req.params.rowId)}}}
        yield db.collection('tables').updateOne(filter, update)
        filter = {rowId: new mongodb.ObjectID(req.params.rowId)}
        yield db.collection('cells').deleteMany(filter)
        res.sendStatus(200)
      }).catch(onError);
    })

  api.route('/tables/:tableId/rows/:rowId/columns/:columnId')
  // Set the value of a table cell
    .put((req, res) => {
      dbFuncs.setCellValue(req.params.rowId, req.params.columnId, req.body.cellValue).then((cellId) => {
        res.send({cellId})
      }).catch(onError)
    })


  api.route('/tables/:tableId/columns/:columnId/rename')
  // Rename a column
    .put(function (req, res) {
      let columnId = new mongodb.ObjectID(req.params.columnId)
      let filter = {_id: new mongodb.ObjectID(req.params.tableId), 'columns.columnId': columnId}
      let update = {$set: {'columns.$.columnName': Crypt.encrypt(req.body.columnName)}}
      db.collection('tables').updateOne(filter, update).then(function () {
        res.sendStatus(200)
      }).catch(onError)
    })

  api.route('/tables/:tableId/columns/:columnId')
  // Update a column field
  // NOTE: this will not work for updating the columnName because column names are encrypted
    .put(function (req, res) {
      let columnId = new mongodb.ObjectID(req.params.columnId)
      let filter = {_id: new mongodb.ObjectID(req.params.tableId), 'columns.columnId': columnId}
      let fieldQuery = `columns.$.${req.body.fieldName}`
      let update = {$set: {[fieldQuery]: req.body.fieldValue}}
      db.collection('tables').updateOne(filter, update).then(function () {
        res.sendStatus(200)
      }).catch(onError)
    })
    // Delete a column
    .delete(function (req, res) {
      co(function* () {
        let filter = {_id: new mongodb.ObjectID(req.params.tableId)}
        let columnId = new mongodb.ObjectID(req.params.columnId)
        let update = {$pull: {columns: {columnId}}}
        yield db.collection('tables').updateOne(filter, update)
        yield db.collection('cells').deleteMany({columnId})
        res.sendStatus(200)
      }).catch(onError);
    })
  return api
}