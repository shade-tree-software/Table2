import React from 'react'
import {ContextMenu, MenuItem, ContextMenuTrigger} from "react-contextmenu";
import Modal from 'react-modal';

import AddColumnButton from './AddColumnButton'
import TextBoxForm from './TextBoxForm'
import TableBody from './TableBody'
import FileUpload from './FileUpload'
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
      sortColumnName: '',
      sortOrder: 'asc',
      colorCodedRows: false
    }
    this.lastServerWrite = new Date(0)
  }

  componentDidMount() {
    this.getTableDetails()
    this.timer = setInterval(() => {
      // Give MongoDB time to sync write data to all shards so we don't get stale data
      if ((new Date() - this.lastServerWrite) > 5000) {
        this.getTableDetails()
      }
    }, 15000)
  }

  componentWillUnmount() {
    clearTimeout(this.timer)
  }

  logWriteEvent = () => {
    this.lastServerWrite = new Date()
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

  updateTable = (tableDetails) => {
    this.setState({...tableDetails, tableId: tableDetails._id})
  }

  getTableDetails = () => {
    fetch('/api/tables/' + this.props.match.params._id + '?token=' + localStorage.authToken).then((response) => {
      if (response.ok) {
        this.props.hideErrorBanner()
      } else {
        throw new Error(response.statusText)
      }
      return response.json()
    }).then(this.updateTable).catch((err) => {
      this.props.showErrorBanner(`Unable to get updates from server (${err.message})`)
    })
  }

  addNewRow = (e) => {
    this.logWriteEvent()
    fetch(`/api/tables/${this.props.match.params._id}/rows?token=${localStorage.authToken}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'post'
    }).then((response) => {
      if (response.ok) {
        this.props.hideErrorBanner()
      } else {
        throw new Error(response.statusText)
      }
      return response.json()
    }).then((newRow) => {
      this.setState((prevState) => ({
        rows: [...prevState.rows, newRow]
      }))
    }).catch((err) => {
      this.props.showErrorBanner(`Unable to save new row to server (${err.message})`)
    })
  }

  setTablePreferences = (tablePreferences) => {
    this.logWriteEvent()
    fetch(`/api/tables/${this.state.tableId}?token=${localStorage.authToken}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'put',
      body: JSON.stringify({values: tablePreferences})
    }).then((response) => {
      if (response.ok) {
        this.props.hideErrorBanner()
      } else {
        throw new Error(response.statusText)
      }
      this.setState(tablePreferences)
    }).catch((err) => {
      this.props.showErrorBanner(`Unable to save sort preferences to server (${err.message})`)
    })
  }

  changeColumnVisibility = (columnId, hiddenOnMobile) => {
    this.logWriteEvent()
    fetch(`/api/tables/${this.state.tableId}/columns/${columnId}?token=${localStorage.authToken}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'put',
      body: JSON.stringify({fieldName: 'hiddenOnMobile', fieldValue: hiddenOnMobile})
    }).then((response) => {
      if (response.ok) {
        this.props.hideErrorBanner()
      } else {
        throw new Error(response.statusText)
      }
      this.setState((prevState) => {
        let columnIndex = prevState.columns.findIndex((column) => (column.columnId === columnId))
        let modifiedColumn = {columnId: columnId, hiddenOnMobile, columnName: prevState.columns[columnIndex].columnName}
        return ({columns: [...prevState.columns.slice(0, columnIndex), modifiedColumn, ...prevState.columns.slice(columnIndex + 1)]});
      })
    }).catch((err) => {
      this.props.showErrorBanner(`Unable to save column visibility preferences to server (${err.message})`)
    })
  }

  onContextMenuItemClick = (e, data, target) => {
    if (data.command === 'delete') {
      this.deleteColumn(target.getAttribute('column-id'))
    } else if (data.command === 'insert') {
      this.setState({insertColumnPosition: target.getAttribute('index')})
      this.showModal()
    } else if (data.command === 'sort-asc') {
      this.setTablePreferences({
        sortColumnId: target.getAttribute('column-id'),
        sortColumnName: target.getAttribute('column-name'),
        sortOrder: 'asc'
      })
    } else if (data.command === 'sort-desc') {
      this.setTablePreferences({
        sortColumnId: target.getAttribute('column-id'),
        sortColumnName: target.getAttribute('column-name'),
        sortOrder: 'desc'
      })
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
    if (window.confirm('Are you sure?')) {
      this.logWriteEvent()
      fetch(`/api/tables/${this.props.match.params._id}/columns/${columnId}?token=${localStorage.authToken}`, {
        method: 'delete',
      }).then((response) => {
        if (response.ok) {
          this.props.hideErrorBanner()
        } else {
          throw new Error(response.statusText)
        }
        let index = this.state.columns.findIndex((elem) => (elem.columnId === columnId))
        this.setState((prevState) => ({columns: [...prevState.columns.slice(0, index), ...prevState.columns.slice(index + 1)]}))
      }).catch((err) => {
        this.props.showErrorBanner(`Unable to delete column from server (${err.message})`)
      })
    }
  }

  insertColumn = (columnName, position) => {
    this.logWriteEvent()
    fetch(`/api/tables/${this.props.match.params._id}/columns?token=${localStorage.authToken}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'post',
      body: JSON.stringify({columnName, position})
    }).then((response) => {
      if (response.ok) {
        this.props.hideErrorBanner()
      } else {
        throw new Error(response.statusText)
      }
      return response.json()
    }).then((columnInfo) => {
      this.setState((prevState) => {
        position = position || prevState.columns.length
        return ({
          columns: [...prevState.columns.slice(0, position), {
            columnName,
            columnId: columnInfo.columnId
          }, ...prevState.columns.slice(position)]
        })
      })
    }).catch((err) => {
      this.props.showErrorBanner(`Unable to save new column to server (${err.message})`)
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

  sortingByDate = () => (this.state.sortColumnName ? this.state.sortColumnName.toLowerCase().includes('date') : false)

  onColorPrefsChange = (e) => {
    console.log(e.target.checked)
    this.setTablePreferences({colorCodedRows: e.target.checked})
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
        <br/>
        <h1>{this.state.tableName}</h1>
        <div className="form-check">
          <label hidden={!this.sortingByDate()} className="form-check-label">
            <input onChange={this.onColorPrefsChange} className="form-check-input" type="checkbox"
                   checked={this.state.colorCodedRows} value=""/>
            Use color-coded rows when sorting by date
          </label>
        </div>
        <table className="table table-hover table-striped">
          <thead>
          <tr className="large-only">
            {this.state.columns.map((column, index) =>
              <th key={index} className="disable-ios-copy-paste">
                <ContextMenuTrigger
                  attributes={{'column-id': column.columnId, 'column-name': column.columnName, index: index}}
                  id="column-header-context-menu">{column.columnName}
                  {this.sortLegend(column.columnId)}</ContextMenuTrigger>
              </th>
            )}
            <th><AddColumnButton insertColumn={this.insertColumn} isFirstColumn={this.state.columns.length === 0}/></th>
          </tr>
          </thead>
          <TableBody
            rows={this.state.rows} columns={this.state.columns} cells={this.state.cells} tableId={this.state.tableId}
            onRowDeleted={this.onRowDeleted} onCellChanged={this.onCellChanged} sortOrder={this.state.sortOrder}
            sortColumnId={this.state.sortColumnId} sortingByDate={this.sortingByDate()}
            colorCodedRows={this.state.colorCodedRows} showHiddenFields={this.showHiddenColumns}
            sortByDate={this.sortByDate} logWriteEvent={this.logWriteEvent}
            changeColumnVisibility={this.changeColumnVisibility} showErrorBanner={this.props.showErrorBanner}
            hideErrorBanner={this.props.hideErrorBanner}/>
        </table>
        {this.state.columns.length === 0 ? '' : <button onClick={this.addNewRow}
                                                        className="btn btn-primary btn-sm">{this.state.rows.length === 0 ? 'Add Row' : '+'}</button>}
        <span className="form-group float-right">
          <FileUpload tableId={this.state.tableId} showErrorBanner={this.props.showErrorBanner}
                      hideErrorBanner={this.props.hideErrorBanner} updateTable={this.updateTable}/>
        </span>
      </div>
    )
  }
}