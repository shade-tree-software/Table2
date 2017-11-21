import React from 'react'
import {ContextMenuTrigger} from "react-contextmenu";

import TextBoxForm from './TextBoxForm'

export default class TableCell extends React.Component {
  constructor(props) {
    super(props)
    this.state = {editing: false}
  }

  okHandler = (cellValue) => {
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
          <ContextMenuTrigger attributes={{'column-id': this.props.column.columnId}}
                              id="mobile-field-context-menu">
            <span className="small-only bold-text">{this.props.column.columnName}: </span>{this.props.text}
          </ContextMenuTrigger>
        </td>
      )
    }
  }
}