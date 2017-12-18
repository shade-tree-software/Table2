import React from 'react'

import TableCell from './TableCell'

export default class TableBody extends React.Component {
  onDeleteRowClick = (e, rowId) => {
    if (window.confirm('Are you sure?')) {
      this.props.logWriteEvent()
      this.props.startNetworkTimer()
      fetch(`/api/tables/${this.props.tableId}/rows/${rowId}?token=${localStorage.authToken}`, {
        method: 'delete',
      }).then((response) => {
        this.props.stopNetworkTimer()
        if (response.ok) {
          this.props.hideErrorBanner()
        } else {
          throw new Error(response.statusText)
        }
        this.props.onRowDeleted(rowId)
      }).catch((err) => {
        this.props.showErrorBanner(`Unable to delete row from server (${err.message})`)
      })
    }
  }

  rowColor = (sortDateText) => {
    let rowColor = ''
    if (sortDateText && this.props.colorCodedRows) {
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

  rowsToHTML = (sortedRows) => {
    let hiddenColumns = false
    this.props.columns.forEach((column) => {
      if (column.hiddenOnMobile) {
        hiddenColumns = true
      }
    })
    return sortedRows.map(([rowId, rowData]) => {
      let sortDateText = this.props.sortingByDate && rowData[this.props.sortColumnId] ? rowData[this.props.sortColumnId].cellText : null
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
                     changeColumnVisibility={this.props.changeColumnVisibility}
                     showErrorBanner={this.props.showErrorBanner}
                     hideErrorBanner={this.props.hideErrorBanner}
                     startNetworkTimer={this.props.startNetworkTimer}
                     stopNetworkTimer={this.props.stopNetworkTimer}/>
        ))}
          <td>
            <button hidden={this.props.printView} onClick={(e) => this.onDeleteRowClick(e, rowId)}
                    className="btn btn-danger btn-sm">X
            </button>
            <button onClick={this.props.showHiddenFields} hidden={!hiddenColumns}
                    className="btn btn-warning btn-sm float-right small-only">Show Hidden Fields
            </button>
          </td>
        </tr>
      )
    })
  }

  render() {
    return (
      <tbody>{this.rowsToHTML(this.props.getSortedRows())}</tbody>
    )
  }
}