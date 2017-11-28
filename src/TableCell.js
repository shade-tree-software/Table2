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
    fetch(`/api/tables/${this.props.tableId}/rows/${this.props.rowId}/columns/${this.props.column.columnId}?token=${localStorage.authToken}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'put',
      body: JSON.stringify({cellValue})
    }).then((response) => {
      return response.json()
    }).then((cellInfo) => {
      this.props.onCellChanged({
        _id: cellInfo.cellId || this.props.cellId,
        value: cellValue,
        rowId: this.props.rowId,
        columnId: this.props.column.columnId
      })
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
          <span className="small-only bold-text">{this.props.column.columnName}: </span>{this.props.text}
          <button onClick={this.onHideColumn} className="btn btn-warning btn-sm float-right small-only">&lt;</button>
        </td>
      )
    }
  }
}