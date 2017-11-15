import React from 'react'

import TableCell from './TableCell'

export default class TableBody extends React.Component {
  onDeleteRowClick = (e, rowId) => {
    fetch(`/api/tables/${this.props.table._id}/rows/${rowId}?token=${sessionStorage.authToken}`, {
      method: 'delete',
    }).then(this.props.onTableChanged())
  }

  render() {
    let rows = this.props.table.rows || []
    let columns = this.props.table.columns || []
    return (
      <tbody>
      {rows.map((row) => {
        let rowValues = {}
        if (row.cells) {
          row.cells.forEach((cell) => rowValues[cell.columnName] = cell.value)
        }
        return (
          <tr className="stackable" key={row.rowId}>{columns.map((column, index) => {
            return (<TableCell key={index}
                               tableId={this.props.table._id}
                               rowId={row.rowId}
                               columnName={column.columnName}
                               text={rowValues[column.columnName] || ''}
                               onCellChanged={this.props.onTableChanged}/>
            )
          })}
            <td>
              <button onClick={(e) => this.onDeleteRowClick(e, row.rowId)} className="btn btn-danger btn-sm">X</button>
            </td>
          </tr>
        )
      })}
      </tbody>
    )
  }
}