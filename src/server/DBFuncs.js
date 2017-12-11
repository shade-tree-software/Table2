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

  deleteTable = (tableId) => {
    let db = this.db
    return new Promise((fulfill, reject) => {
      co(function* () {
        let filter = {_id: new mongodb.ObjectID(tableId)}
        let table = yield db.collection('tables').findOne(filter)
        let rowIds = table.rows ? table.rows.map((row) => (row.rowId)) : []
        yield db.collection('cells').deleteMany({rowId: {$in: rowIds}})
        yield db.collection('tables').deleteOne(filter)
        fulfill()
      }).catch(reject);
    })
  }

  addColumn = (tableId, columnNamePlaintext, columnPosition) => {
    return new Promise((fulfill, reject) => {
      let filter = {_id: new mongodb.ObjectID(tableId)}
      let update
      let columnId = new mongodb.ObjectID()
      let columnName = Crypt.encrypt(columnNamePlaintext)
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
      let colIds = {}
      for (let colIndex = 0; colIndex < columnNames.length; colIndex++) {
        this.addColumn(tableId, columnNames[colIndex]).then((colId) => {
          colIds[colIndex] = colId
          if (Object.keys(colIds).length === columnNames.length) {
            fulfill(colIds)
          }
        }).catch(reject)
      }
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

  addRowsWithCellData = (tableId, cellDataByRow) => {
    return new Promise((fulfill, reject) => {
      let numCellsToAdd = !cellDataByRow || cellDataByRow.length === 0 ? 0 : cellDataByRow.length * cellDataByRow[0].length
      cellDataByRow.forEach((rowCellData) => {
        this.addRow(tableId).then((rowId) => {
          rowCellData.forEach((cellData) => {
            this.setCellValue(rowId, cellData.colId, cellData.value).then(() => {
              numCellsToAdd--
              if (numCellsToAdd === 0) {
                fulfill()
              }
            })
          })
        }).catch(reject)
      })
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