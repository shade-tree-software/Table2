import React from 'react'
import {ContextMenu, MenuItem, ContextMenuTrigger} from "react-contextmenu";

import AddColumnButton from './AddColumnButton'
import './ReactContextMenu.css'

export default class TableDetail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {table: {tableName: ''}}
  }

  getTableDetails = () => {
    fetch('/api/tables/' + this.props.match.params._id + '?token=' + sessionStorage.authToken).then((response) => {
      return response.json()
    }).then((table) => {
      this.setState({table})
    })
  }

  addNewRow = (e) => {

  }

  componentDidMount() {
    this.getTableDetails()
  }

  onContextMenuItemClick = (e, data, target) => {
    if (data.command === 'delete') {
      this.deleteColumn(target.getAttribute('column-name'))
    }
  }

  deleteColumn = (columnName) => {
    fetch(`/api/tables/${this.props.match.params._id}/columns/${encodeURIComponent(columnName)}?token=${sessionStorage.authToken}`, {
      method: 'delete',
    }).then(this.getTableDetails())
  }

  render() {
    let columns = this.state.table.columns || []
    return (
      <div>
        <ContextMenu id="column-name-context-menu">
          <MenuItem data={{command: 'delete'}} onClick={this.onContextMenuItemClick}>
            Delete Column
          </MenuItem>
        </ContextMenu>
        <br/>
        <h1>{this.state.table.tableName}</h1>
        <table className="table table-hover table-responsive">
          <thead>
          <tr>
            {columns.map((column) =>
              <th key={column.columnName}>
                <ContextMenuTrigger attributes={{'column-name': column.columnName}}
                                    id="column-name-context-menu">{column.columnName}</ContextMenuTrigger>
              </th>
            )}
            <th><AddColumnButton tableId={this.props.match.params._id} onColumnAdded={this.getTableDetails}/></th>
          </tr>
          </thead>
          <tbody>
          </tbody>
        </table>
        <button onClick={this.addNewRow} className="btn btn-primary btn-sm">Add Row</button>
      </div>
    )
  }
}