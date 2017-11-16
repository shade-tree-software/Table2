import React from 'react'

import TextBoxForm from './TextBoxForm'

export default class TableCell extends React.Component {
  constructor(props) {
    super(props)
    this.state = {editing: false}
  }

  okHandler = (cellValue) => {
    this.setState({editing: false})
    fetch(`/api/tables/${this.props.tableId}/rows/${this.props.rowId}?token=${sessionStorage.authToken}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'put',
      body: JSON.stringify({columnName: this.props.columnName, cellValue})
    }).then((response) => {
      return response.json()
    }).then((cellInfo) => {
      this.props.onCellChanged({
        _id: cellInfo.cellId,
        value: cellValue,
        rowId: this.props.rowId,
        columnName: this.props.columnName
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
          <span className="small-only bold-text">{this.props.columnName}: </span>
          <TextBoxForm initialText={this.props.text} onOk={this.okHandler} onCancel={this.cancelHandler}/>
        </td>
      )
    } else {
      return (
        <td onClick={this.onCellClick}>
          <span className="small-only bold-text">{this.props.columnName}: </span>{this.props.text}
        </td>
      )
    }
  }
}