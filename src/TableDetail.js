import React from 'react'
import {ContextMenu, MenuItem, ContextMenuTrigger} from "react-contextmenu";
import Modal from 'react-modal';

import AddColumnButton from './AddColumnButton'
import TextBoxForm from './TextBoxForm'
import TableBody from './TableBody'
import './ReactContextMenu.css'

export default class TableDetail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {table: {tableName: ''}, isShowingModal: false}
  }

  componentDidMount() {
    this.getTableDetails()
  }

  showModal = () => {
    this.setState({isShowingModal: true})
  }

  cancelModal = () => {
    this.setState({isShowingModal: false})
  }

  okModal = (columnName) => {
    this.setState({isShowingModal: false})
    this.insertColumn(columnName, this.state.insertColumnPosition)
  }

  getTableDetails = () => {
    fetch('/api/tables/' + this.props.match.params._id + '?token=' + sessionStorage.authToken).then((response) => {
      return response.json()
    }).then((table) => {
      this.setState({table})
    })
  }

  addNewRow = (e) => {
    fetch(`/api/tables/${this.props.match.params._id}/rows?token=${sessionStorage.authToken}`, {
      method: 'post'
    }).then(this.getTableDetails())
  }

  onContextMenuItemClick = (e, data, target) => {
    if (data.command === 'delete') {
      this.deleteColumn(target.getAttribute('column-name'))
    } else if (data.command === 'insert') {
      this.setState({insertColumnPosition: target.getAttribute('index')})
      this.showModal()
    }
  }

  deleteColumn = (columnName) => {
    fetch(`/api/tables/${this.props.match.params._id}/columns/${encodeURIComponent(columnName)}?token=${sessionStorage.authToken}`, {
      method: 'delete',
    }).then(this.getTableDetails())
  }

  insertColumn = (columnName, position) => {
    fetch(`/api/tables/${this.props.match.params._id}/columns?token=${sessionStorage.authToken}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'post',
      body: JSON.stringify({columnName, position})
    }).then(this.getTableDetails())
  }

  render() {
    let columns = this.state.table.columns || []
    return (
      <div>
        <Modal isOpen={this.state.isShowingModal} onRequestClose={this.cancelModal} contentLabel="Column Name"
               style={{content: {display: 'inline-block', right: 'unset', bottom: 'unset'}}}>
          <TextBoxForm onOk={this.okModal} onCancel={this.cancelModal} placeholder='Column Name'/>
        </Modal>
        <ContextMenu id="column-name-context-menu">
          <MenuItem data={{command: 'insert'}} onClick={this.onContextMenuItemClick}>
            Insert Column
          </MenuItem>
          <MenuItem data={{command: 'delete'}} onClick={this.onContextMenuItemClick}>
            Delete Column
          </MenuItem>
        </ContextMenu>
        <br/>
        <h1>{this.state.table.tableName}</h1>
        <table className="table table-hover table-responsive table-striped">
          <thead>
          <tr className="large-only">
            {columns.map((column, index) =>
              <th key={index}>
                <ContextMenuTrigger attributes={{'column-name': column.columnName, index: index}}
                                    id="column-name-context-menu">{column.columnName}</ContextMenuTrigger>
              </th>
            )}
            <th><AddColumnButton insertColumn={this.insertColumn}/></th>
          </tr>
          </thead>
          <TableBody table={this.state.table} onTableChanged={this.getTableDetails}/>
        </table>
        <button onClick={this.addNewRow} className="btn btn-primary btn-sm">+</button>
      </div>
    )
  }
}