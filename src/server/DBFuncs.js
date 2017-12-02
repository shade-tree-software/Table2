import mongodb from 'mongodb'
import Crypt from './Crypt'
import co from 'co'

export default class DBFuncs {

  constructor(db) {
    this.db = db
  }

  getTableDetails = (tableId) => {
    let db = this.db
    return new Promise((fulfill, reject) => {
      co(function* () {
        let filter = {_id: new mongodb.ObjectID(tableId)}
        let table = yield db.collection('tables').findOne(filter)
        let rowIds = table.rows ? table.rows.map((row) => (row.rowId)) : []
        let cells = yield db.collection('cells').find({rowId: {$in: rowIds}}).toArray()
        let decryptedCells = cells.map((cell) => ({...cell, value: Crypt.decrypt(cell.value)}))
        if (table.columns) {
          table.columns.forEach(function (column) {
            column.columnName = Crypt.decrypt(column.columnName)
          })
        }
        fulfill({rows: [], columns: [], ...table, cells: decryptedCells})
      }).catch(reject);
    })
  }

  addColumn = (tableId, columnNamePlaintext, columnPosition) => {
    return new Promise((fulfill, reject) => {
      let filter = {_id: new mongodb.ObjectID(tableId)}
      let update
      let columnId = new mongodb.ObjectID()
      console.log(columnNamePlaintext)
      let columnName = Crypt.encrypt(columnNamePlaintext)
      console.log(columnName)
      if (columnPosition) {
        let position = parseInt(columnPosition)
        update = {
          $push: {
            columns: {
              $each: [{columnName, columnId}],
              $position: position
            }
          }
        }
      } else {
        update = {$push: {columns: {columnName, columnId}}}
      }
      this.db.collection('tables').updateOne(filter, update).then(() => {
        fulfill(columnId)
      }).catch(reject)
    });
  }

  addColumns = (tableId, columnNames) => {
    return new Promise((fulfill, reject) => {
      let count = columnNames.length
      columnNames.forEach((columnName) => {
        this.addColumn(tableId, columnName).then(() => {
          count--
          if (count === 0){
            fulfill()
          }
        }).catch(reject)
      })
    })
  }

  addRow = (tableId) => {
    return new Promise((fulfill, reject) => {
      let filter = {_id: new mongodb.ObjectID(tableId)}
      let rowId = new mongodb.ObjectId()
      let update = {$push: {rows: {rowId}}}
      this.db.collection('tables').updateOne(filter, update).then(() => {
        fulfill(rowId)
      }).catch(reject)
    })
  }

  setCellValue = (rowIdText, columnIdText, cellValue) => {
    return new Promise((fulfill, reject) => {
      let rowId = new mongodb.ObjectID(rowIdText)
      let columnId = new mongodb.ObjectID(columnIdText)
      let filter = {rowId, columnId}
      let update = {
        rowId, columnId, value: Crypt.encrypt(cellValue)
      }
      this.db.collection('cells').updateOne(filter, update, {upsert: true}).then((r) => {
        fulfill(r.upsertedId ? r.upsertedId._id : null)
      }).catch(reject)
    })
  }

}