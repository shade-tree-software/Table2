import React from 'react'

import TextBoxForm from './TextBoxForm'

export default class TableCell extends React.Component {
  constructor(props) {
    super(props)
    this.state = {editing: false}
  }

  okHandler = (cellValue) => {
    this.props.logWriteEvent()
    this.setState({editing: false})
    this.props.startNetworkTimer()
    fetch(`/api/tables/${this.props.tableId}/rows/${this.props.rowId}/columns/${this.props.column.columnId}?token=${localStorage.authToken}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'put',
      body: JSON.stringify({cellValue})
    }).then((response) => {
      this.props.stopNetworkTimer()
      if (response.ok) {
        this.props.hideErrorBanner()
      } else {
        throw new Error(response.statusText)
      }
      return response.json()
    }).then((cellInfo) => {
      this.props.onCellChanged({
        _id: cellInfo.cellId || this.props.cellId,
        value: cellValue,
        rowId: this.props.rowId,
        columnId: this.props.column.columnId
      })
    }).catch((err) => {
      this.props.showErrorBanner(`Unable to save new cell data to server (${err.message})`)
    })
  }

  cancelHandler = (e) => {
    this.setState({editing: false})
  }

  onCellClick = (e) => {
    this.setState({editing: true})
  }

  onHideColumn = (e) => {
    e.stopPropagation()
    this.props.changeColumnVisibility(this.props.column.columnId, true)
  }

  useRedText = () => {
    // Show cell text in red if it is a date and it is more than 30 days in the past,
    // but only if the user has selected the colorCodedRows option
    let cellDate = (new Date(this.props.text))
    return this.props.colorCodedRows &&
      this.props.column.columnName.toLowerCase().includes('date') &&
      cellDate.toString() !== 'Invalid Date' &&
      ((new Date()) - cellDate) > 2592000000
  }

  render() {
    if (this.state.editing) {
      return (
        <td>
          <span className="small-only bold-text">{this.props.column.columnName}: </span>
          <TextBoxForm initialText={this.props.text} onOk={this.okHandler}
                       onCancel={this.cancelHandler}/>
        </td>
      )
    } else {
      return (
        <td onClick={this.onCellClick} className={this.props.column.hiddenOnMobile ? 'large-only' : ''}>
          <span hidden={this.props.printView} className="small-only bold-text">{this.props.column.columnName}: </span>
          <span className={this.useRedText() ? 'red-text' : ''}>{this.props.text}</span>
          <button onClick={this.onHideColumn} hidden={this.props.printView}
                  className="btn btn-warning btn-sm float-right small-only">&lt;</button>
        </td>
      )
    }
  }
}