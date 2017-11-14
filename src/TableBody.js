import React from 'react'

import TableCell from './TableCell'

export default class TableBody extends React.Component {
  render() {
    return (
      <tbody>
      {this.props.rows.map((row) =>
        <tr key={row.rowId} data-row_id={row.rowId}>{this.props.columns.map((column, index) => {
          let text = row.values ? row.values[column.columnName] || '' : ''
          return (<TableCell key={index}
                             text={text}/>
          )
        })}
          <td>
            <button className="btn btn-danger btn-sm">Delete Row</button>
          </td>
        </tr>
      )}
      </tbody>
    )
  }
}