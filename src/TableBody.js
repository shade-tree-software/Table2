import React from 'react'

import TableCell from './TableCell'

export default class TableBody extends React.Component {
  onDeleteRowClick = (e, rowId) => {
    this.props.logWriteEvent()
    fetch(`/api/tables/${this.props.tableId}/rows/${rowId}?token=${localStorage.authToken}`, {
      method: 'delete',
    }).then(this.props.onRowDeleted(rowId))
  }

  rowColor = (sortDateText) => {
    let rowColor = ''
    if (sortDateText) {
      if (sortDateText === 'deleted' || sortDateText === 'unknown') {
        rowColor = 'row-color-na'
      }
      let sortDate = new Date(sortDateText)
      if (sortDate.toString() === 'Invalid Date') {
        rowColor = 'row-color-invalid'
      } else if (((new Date()) - sortDate) > 604800000) { // one week
        rowColor = 'row-color-b'
      } else if (((new Date()) - sortDate) > 172800000) { // two days
        rowColor = 'row-color-a'
      }
    }
    return rowColor
  }

  render() {
    let rows = {}
    this.props.rows.forEach((row) => {
      rows[row.rowId] = {}
    })
    this.props.cells.forEach((cell) => {
      if (rows[cell.rowId]) {
        rows[cell.rowId][cell.columnId] = {cellId: cell._id, cellText: cell.value}
      }
    })
    let hiddenColumns = false
    let sortingByDate = false
    this.props.columns.forEach((column) => {
      if (column.hiddenOnMobile) {
        hiddenColumns = true
      }
      if (column.columnId === this.props.sortColumnId && column.columnName.toLowerCase().includes('date')) {
        sortingByDate = true
      }
    })
    let sortedRows = Object.entries(rows).sort(([, rowDataA], [, rowDataB]) => {
      let a, b
      if (sortingByDate) {
        let textA = rowDataA[this.props.sortColumnId] ? rowDataA[this.props.sortColumnId].cellText : ''
        let textB = rowDataB[this.props.sortColumnId] ? rowDataB[this.props.sortColumnId].cellText : ''
        let dateA = new Date(textA)
        let dateB = new Date(textB)
        let dateAisValid = dateA.toString() !== 'Invalid Date'
        let dateBisValid = dateB.toString() !== 'Invalid Date'
        if (dateAisValid && dateBisValid) {
          a = dateA
          b = dateB
        } else if (!dateAisValid && !dateBisValid) {
          a = textA
          b = textB
        } else {
          a = dateAisValid ? dateA : new Date(0)
          b = dateBisValid ? dateB : new Date(0)
        }
      } else {
        a = rowDataA[this.props.sortColumnId] ? rowDataA[this.props.sortColumnId].cellText : ''
        b = rowDataB[this.props.sortColumnId] ? rowDataB[this.props.sortColumnId].cellText : ''
      }
      if (a < b) {
        return this.props.sortOrder === 'asc' ? -1 : 1;
      }
      if (a > b) {
        return this.props.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    })
    let htmlRows = sortedRows.map(([rowId, rowData]) => {
      let sortDateText = sortingByDate && rowData[this.props.sortColumnId] ? rowData[this.props.sortColumnId].cellText : null
      return (
        <tr className={`stackable ${this.rowColor(sortDateText)}`}
            key={rowId}>{this.props.columns.map((column, index) => (
          <TableCell key={index}
                     tableId={this.props.tableId}
                     rowId={rowId}
                     column={column}
                     text={rowData[column.columnId] ? rowData[column.columnId].cellText : ''}
                     cellId={rowData[column.columnId] ? rowData[column.columnId].cellId : null}
                     onCellChanged={this.props.onCellChanged}
                     logWriteEvent={this.props.logWriteEvent}
                     changeColumnVisibility={this.props.changeColumnVisibility}/>
        ))}
          <td>
            <button onClick={(e) => this.onDeleteRowClick(e, rowId)} className="btn btn-danger btn-sm">X</button>
            <button onClick={this.props.showHiddenFields} hidden={!hiddenColumns}
                    className="btn btn-warning btn-sm float-right small-only">Show Hidden Fields
            </button>
          </td>
        </tr>
      )
    })
    return (
      <tbody>{htmlRows}</tbody>
    )
  }
}