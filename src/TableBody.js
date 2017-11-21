import React from 'react'

import TableCell from './TableCell'

export default class TableBody extends React.Component {
  onDeleteRowClick = (e, rowId) => {
    fetch(`/api/tables/${this.props.tableId}/rows/${rowId}?token=${localStorage.authToken}`, {
      method: 'delete',
    }).then(this.props.onRowDeleted(rowId))
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
      if (column.columnId === this.props.sortColumnId && column.columnName.toLowerCase().includes('date')){
        sortingByDate = true
      }
    })
    let tableRows = Object.entries(rows).sort(([, rowDataA], [, rowDataB]) => {
      let a = rowDataA[this.props.sortColumnId] ? rowDataA[this.props.sortColumnId].cellText : ''
      let b = rowDataB[this.props.sortColumnId] ? rowDataB[this.props.sortColumnId].cellText : ''
      if (sortingByDate ? new Date(a) < new Date(b) : a < b) {
        return this.props.sortOrder === 'asc' ? -1 : 1;
      }
      if (sortingByDate ? new Date(a) > new Date(b) : a > b) {
        return this.props.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    }).map(([rowId, rowData]) => {
      return (
        <tr className="stackable" key={rowId}>{this.props.columns.map((column, index) => (
          <TableCell key={index}
                     tableId={this.props.tableId}
                     rowId={rowId}
                     column={column}
                     text={rowData[column.columnId] ? rowData[column.columnId].cellText : ''}
                     cellId={rowData[column.columnId] ? rowData[column.columnId].cellId : null}
                     onCellChanged={this.props.onCellChanged}/>
        ))}
          <td>
            <button onClick={(e) => this.onDeleteRowClick(e, rowId)} className="btn btn-danger btn-sm">X</button>
            <button onClick={this.props.showHiddenFields} hidden={!hiddenColumns}
                    className="btn btn-success btn-sm float-right small-only">Show Hidden Fields
            </button>
          </td>
        </tr>
      )
    })
    return (
      <tbody>{tableRows}</tbody>
    )
  }
}