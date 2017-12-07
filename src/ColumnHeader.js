import React from 'react'
import {ContextMenuTrigger} from "react-contextmenu";

import TextBoxForm from './TextBoxForm'

export default class ColumnHeader extends React.Component {
  constructor(props) {
    super(props)
    this.state = {editing: false}
  }

  okHandler = (columnName) => {
    this.props.logWriteEvent()
    this.setState({editing: false})
    this.props.startNetworkTimer()
    fetch(`/api/tables/${this.props.tableId}/columns/${this.props.column.columnId}/rename?token=${localStorage.authToken}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'put',
      body: JSON.stringify({columnName})
    }).then((response) => {
      this.props.stopNetworkTimer()
      if (response.ok) {
        this.props.hideErrorBanner()
      } else {
        throw new Error(response.statusText)
      }
      this.props.onColumnRenamed({
        columnName,
        columnId: this.props.column.columnId
      })
    }).catch((err) => {
      this.props.showErrorBanner(`Unable to save new column name to server (${err.message})`)
    })
  }

  cancelHandler = (e) => {
    this.setState({editing: false})
  }

  onColumnNameClick = (e) => {
    this.setState({editing: true})
  }

  render() {
    let column = this.props.column
    let index = this.props.index
    if (this.state.editing) {
      return (
        <td>
          <TextBoxForm initialText={column.columnName} onOk={this.okHandler}
                       onCancel={this.cancelHandler}/>
        </td>
      )
    } else {
      return (
        <th key={index} className="disable-ios-copy-paste">
          <ContextMenuTrigger
            attributes={{'column-id': column.columnId, 'column-name': column.columnName, index: index}}
            id="column-header-context-menu"><span onClick={this.onColumnNameClick}>{column.columnName}</span>
            {this.props.sortLegend(column.columnId)}</ContextMenuTrigger>
        </th>
      )
    }
  }
}