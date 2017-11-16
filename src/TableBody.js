import React from 'react'

import TableCell from './TableCell'

export default class TableBody extends React.Component {
  onDeleteRowClick = (e, rowId) => {
    fetch(`/api/tables/${this.props.tableId}/rows/${rowId}?token=${sessionStorage.authToken}`, {
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
        rows[cell.rowId][cell.columnName] = {cellId: cell._id, cellText: cell.value}
      }
    })
    return (
      <tbody>
      {Object.entries(rows).map(([rowId, rowData]) => {
        return (
          <tr className="stackable" key={rowId}>{this.props.columns.map((column, index) => (
            <TableCell key={index}
                       tableId={this.props.tableId}
                       rowId={rowId}
                       columnName={column.columnName}
                       text={rowData[column.columnName] ? rowData[column.columnName].cellText : ''}
                       cellId={rowData[column.columnName] ? rowData[column.columnName].cellId : null}
                       onCellChanged={this.props.onCellChanged}/>
          ))}
            <td>
              <button onClick={(e) => this.onDeleteRowClick(e, rowId)} className="btn btn-danger btn-sm">X</button>
            </td>
          </tr>
        )
      })}
      </tbody>
    )
  }
}