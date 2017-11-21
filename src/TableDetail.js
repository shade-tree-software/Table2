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
    this.state = {
      rows: [],
      columns: [],
      cells: [],
      tableName: '',
      tableId: '',
      isShowingModal: false,
      sortColumnId: '',
      sortOrder: 'asc'
    }
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
    fetch('/api/tables/' + this.props.match.params._id + '?token=' + localStorage.authToken).then((response) => {
      return response.json()
    }).then((tableData) => {
      this.setState({...tableData, tableId: tableData._id})
    })
  }

  addNewRow = (e) => {
    fetch(`/api/tables/${this.props.match.params._id}/rows?token=${localStorage.authToken}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'post'
    }).then((response) => {
      return response.json()
    }).then((newRow) => {
      this.setState((prevState) => ({
        rows: [...prevState.rows, newRow]
      }))
    })
  }

  setSortCriteria = (sortColumnId, sortOrder) => {
    fetch(`/api/tables/${this.state.tableId}?token=${localStorage.authToken}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'put',
      body: JSON.stringify({values: {sortColumnId, sortOrder}})
    }).then(() => {
      this.setState({sortColumnId, sortOrder})
    })
  }

  changeColumnVisibility = (columnId, hiddenOnMobile) => {
    fetch(`/api/tables/${this.state.tableId}/columns/${columnId}?token=${localStorage.authToken}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'put',
      body: JSON.stringify({fieldName: 'hiddenOnMobile', fieldValue: hiddenOnMobile})
    }).then(() => {
      this.setState((prevState) => {
        let columnIndex = prevState.columns.findIndex((column) => (column.columnId === columnId))
        let modifiedColumn = {columnId: columnId, hiddenOnMobile, columnName: prevState.columns[columnIndex].columnName}
        return ({columns: [...prevState.columns.slice(0, columnIndex), modifiedColumn, ...prevState.columns.slice(columnIndex + 1)]});
      })
    })
  }

  onContextMenuItemClick = (e, data, target) => {
    if (data.command === 'delete') {
      this.deleteColumn(target.getAttribute('column-id'))
    } else if (data.command === 'insert') {
      this.setState({insertColumnPosition: target.getAttribute('index')})
      this.showModal()
    } else if (data.command === 'sort-asc') {
      this.setSortCriteria(target.getAttribute('column-id'), 'asc')
    } else if (data.command === 'sort-desc') {
      this.setSortCriteria(target.getAttribute('column-id'), 'desc')
    } else if (data.command === 'hide') {
      this.changeColumnVisibility(target.getAttribute('column-id'), true)
    }
  }

  showHiddenColumns = () => {
    this.state.columns.forEach((column) => {
      if (column.hiddenOnMobile === true) {
        this.changeColumnVisibility(column.columnId, false)
      }
    })
  }

  deleteColumn = (columnId) => {
    fetch(`/api/tables/${this.props.match.params._id}/columns/${columnId}?token=${localStorage.authToken}`, {
      method: 'delete',
    }).then(() => {
      let index = this.state.columns.findIndex((elem) => (elem.columnId === columnId))
      this.setState((prevState) => ({columns: [...prevState.columns.slice(0, index), ...prevState.columns.slice(index + 1)]}))
    })
  }

  insertColumn = (columnName, position) => {
    fetch(`/api/tables/${this.props.match.params._id}/columns?token=${localStorage.authToken}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'post',
      body: JSON.stringify({columnName, position})
    }).then((response) => {
      return response.json()
    }).then((columnInfo) => {
      this.setState((prevState) => {
        position = position || prevState.columns.length
        return ({columns: [...prevState.columns.slice(0, position), {columnName, columnId: columnInfo.columnId}, ...prevState.columns.slice(position)]})
      })
    })
  }

  onRowDeleted = (rowId) => {
    let index = this.state.rows.findIndex((elem) => (elem.rowId === rowId))
    this.setState((prevState) => ({rows: [...prevState.rows.slice(0, index), ...prevState.rows.slice(index + 1)]}))
  }

  onCellChanged = (cell) => {
    this.setState((prevState) => {
      let index = prevState.cells.findIndex((elem) => (elem._id === cell._id))
      if (index >= 0) {
        return ({cells: [...prevState.cells.slice(0, index), cell, ...prevState.cells.slice(index + 1)]})
      } else {
        return ({cells: [...prevState.cells, cell]})
      }
    })
  }

  sortLegend = (columnId) => {
    if (columnId === this.state.sortColumnId) {
      return this.state.sortOrder === 'asc' ? <span> &#x25B2;</span> : <span> &#x25BC;</span>
    }
  }

  render() {
    return (
      <div>
        <Modal isOpen={this.state.isShowingModal} onRequestClose={this.cancelModal} contentLabel="Column Name"
               style={{content: {display: 'inline-block', right: 'unset', bottom: 'unset'}}}>
          <TextBoxForm onOk={this.okModal} onCancel={this.cancelModal} placeholder='Column Name'/>
        </Modal>
        <ContextMenu id="column-header-context-menu">
          <MenuItem data={{command: 'sort-asc'}} onClick={this.onContextMenuItemClick}>
            Sort Column Ascending
          </MenuItem>
          <MenuItem data={{command: 'sort-desc'}} onClick={this.onContextMenuItemClick}>
            Sort Column Descending
          </MenuItem>
          <MenuItem data={{command: 'insert'}} onClick={this.onContextMenuItemClick}>
            Insert Column
          </MenuItem>
          <MenuItem data={{command: 'delete'}} onClick={this.onContextMenuItemClick}>
            Delete Column
          </MenuItem>
        </ContextMenu>
        <ContextMenu id="mobile-field-context-menu">
          <MenuItem data={{command: 'hide'}} onClick={this.onContextMenuItemClick}>
            Hide this field
          </MenuItem>
        </ContextMenu>
        <br/>
        <h1>{this.state.tableName}</h1>
        <table className="table table-hover table-striped">
          <thead>
          <tr className="large-only">
            {this.state.columns.map((column, index) =>
              <th key={index}>
                <ContextMenuTrigger attributes={{'column-id': column.columnId, index: index}}
                                    id="column-header-context-menu">{column.columnName}
                  {this.sortLegend(column.columnId)}</ContextMenuTrigger>
              </th>
            )}
            <th><AddColumnButton insertColumn={this.insertColumn}/></th>
          </tr>
          </thead>
          <TableBody
            rows={this.state.rows} columns={this.state.columns} cells={this.state.cells} tableId={this.state.tableId}
            onRowDeleted={this.onRowDeleted} onCellChanged={this.onCellChanged} sortColumnId={this.state.sortColumnId}
            sortOrder={this.state.sortOrder} showHiddenFields={this.showHiddenColumns}/>
        </table>
        <button onClick={this.addNewRow} className="btn btn-primary btn-sm">+</button>
      </div>
    )
  }
}