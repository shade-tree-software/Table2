import React from 'react'
import {ContextMenu, MenuItem} from "react-contextmenu";
import Modal from 'react-modal';

import AddColumnButton from './AddColumnButton'
import TextBoxForm from './TextBoxForm'
import TableBody from './TableBody'
import ImportCSV from './ImportCSV'
import ColumnHeader from './ColumnHeader'
import ExportCSV from "./ExportCSV"
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
    this.props.startNetworkTimer()
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
      this.props.stopNetworkTimer()
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
    this.props.startNetworkTimer()
    fetch(`/api/tables/${this.props.match.params._id}/rows?token=${localStorage.authToken}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'post'
    }).then((response) => {
      this.props.stopNetworkTimer()
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
    this.props.startNetworkTimer()
    fetch(`/api/tables/${this.state.tableId}?token=${localStorage.authToken}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'put',
      body: JSON.stringify({values: tablePreferences})
    }).then((response) => {
      this.props.stopNetworkTimer()
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
    this.props.startNetworkTimer()
    fetch(`/api/tables/${this.state.tableId}/columns/${columnId}?token=${localStorage.authToken}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'put',
      body: JSON.stringify({fieldName: 'hiddenOnMobile', fieldValue: hiddenOnMobile})
    }).then((response) => {
      this.props.stopNetworkTimer()
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
      this.props.startNetworkTimer()
      fetch(`/api/tables/${this.props.match.params._id}/columns/${columnId}?token=${localStorage.authToken}`, {
        method: 'delete',
      }).then((response) => {
        this.props.stopNetworkTimer()
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
    this.props.startNetworkTimer()
    fetch(`/api/tables/${this.props.match.params._id}/columns?token=${localStorage.authToken}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'post',
      body: JSON.stringify({columnName, position})
    }).then((response) => {
      this.props.stopNetworkTimer()
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

  onCellChanged = (changedCell) => {
    this.setState((prevState) => {
      let index = prevState.cells.findIndex((originalCell) => (originalCell._id === changedCell._id))
      if (index >= 0) {
        return ({cells: [...prevState.cells.slice(0, index), changedCell, ...prevState.cells.slice(index + 1)]})
      } else {
        return ({cells: [...prevState.cells, changedCell]})
      }
    })
  }

  onColumnRenamed = (renamedColumn) => {
    this.setState((prevState) => {
      let index = prevState.columns.findIndex((originalColumn) => (originalColumn.columnId === renamedColumn.columnId))
      if (index >= 0) {
        return ({columns: [...prevState.columns.slice(0, index), renamedColumn, ...prevState.columns.slice(index + 1)]})
      } else {
        return ({columns: [...prevState.columns, renamedColumn]})
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

  getSortedRows = () => {
    let rows = {}
    this.state.rows.forEach((row) => {
      rows[row.rowId] = {}
    })
    this.state.cells.forEach((cell) => {
      if (rows[cell.rowId]) {
        rows[cell.rowId][cell.columnId] = {cellId: cell._id, cellText: cell.value}
      }
    })
    return Object.entries(rows).sort(([, rowDataA], [, rowDataB]) => {
      let a, b
      if (this.sortingByDate()) {
        let textA = rowDataA[this.state.sortColumnId] ? rowDataA[this.state.sortColumnId].cellText : ''
        let textB = rowDataB[this.state.sortColumnId] ? rowDataB[this.state.sortColumnId].cellText : ''
        let dateA = new Date(textA)
        let dateB = new Date(textB)
        let dateAisValid = dateA.toString() !== 'Invalid Date'
        let dateBisValid = dateB.toString() !== 'Invalid Date'
        if (dateAisValid && dateBisValid) {
          a = dateA
          b = dateB
        } else if (!dateAisValid && !dateBisValid) {
          a = textA
          b = textB
        } else {
          a = dateAisValid ? dateA : new Date(0)
          b = dateBisValid ? dateB : new Date(0)
        }
      } else {
        a = rowDataA[this.state.sortColumnId] ? rowDataA[this.state.sortColumnId].cellText : ''
        b = rowDataB[this.state.sortColumnId] ? rowDataB[this.state.sortColumnId].cellText : ''
      }
      if (a < b) {
        return this.state.sortOrder === 'asc' ? -1 : 1;
      }
      if (a > b) {
        return this.state.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    })
  }

  saveCSVFileToDisk = (csvText) => {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvText));
    element.setAttribute('download', `${this.state.tableName}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  generateCSVText = () => {
    let csvText = ''
    this.state.columns.forEach((column, index) => {
      csvText += index === 0 ? '' : ','
      csvText += column.columnName
    })
    this.getSortedRows().forEach(([rowId, rowData]) => {
      this.state.columns.forEach((column, index) => {
        csvText += index === 0 ? '\n' : ','
        let data = rowData[column.columnId] ? rowData[column.columnId].cellText : ''
        let dataContainsCommas = data.includes(',')
        csvText += dataContainsCommas ? '"' : ''
        csvText += data
        csvText += dataContainsCommas ? '"' : ''
      })
    })
    return csvText
  }

  exportCSV = () => {
    this.saveCSVFileToDisk(this.generateCSVText())
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
        <h1 className="margin-small">{this.state.tableName}</h1>
        <div className="form-check margin-small">
          <label hidden={!this.sortingByDate()} className="form-check-label my-2">
            <input onChange={this.onColorPrefsChange} className="form-check-input" type="checkbox"
                   checked={this.state.colorCodedRows} value=""/>
            Use color-coded rows when sorting by date
          </label>
        </div>
        <table className="table table-hover table-striped">
          <thead>
          <tr className="large-only">
            {this.state.columns.map((column, index) =>
              <ColumnHeader key={index} tableId={this.state.tableId} column={column} index={index}
                            sortLegend={this.sortLegend}
                            onColumnRenamed={this.onColumnRenamed}
                            logWriteEvent={this.logWriteEvent} showErrorBanner={this.props.showErrorBanner}
                            hideErrorBanner={this.props.hideErrorBanner}
                            startNetworkTimer={this.props.startNetworkTimer}
                            stopNetworkTimer={this.props.stopNetworkTimer}/>
            )}
            <th><AddColumnButton insertColumn={this.insertColumn} isFirstColumn={this.state.columns.length === 0}/></th>
          </tr>
          </thead>
          <TableBody
            rows={this.state.rows} columns={this.state.columns} cells={this.state.cells} tableId={this.state.tableId}
            onRowDeleted={this.onRowDeleted} onCellChanged={this.onCellChanged} sortOrder={this.state.sortOrder}
            sortColumnId={this.state.sortColumnId} sortingByDate={this.sortingByDate()}
            colorCodedRows={this.state.colorCodedRows} showHiddenFields={this.showHiddenColumns}
            sortByDate={this.sortByDate} changeColumnVisibility={this.changeColumnVisibility}
            getSortedRows={this.getSortedRows}
            logWriteEvent={this.logWriteEvent} showErrorBanner={this.props.showErrorBanner}
            hideErrorBanner={this.props.hideErrorBanner} startNetworkTimer={this.props.startNetworkTimer}
            stopNetworkTimer={this.props.stopNetworkTimer}/>
        </table>
        <div className="margin-small">
        {this.state.columns.length === 0 ? '' : <button onClick={this.addNewRow}
                                                        className="btn btn-primary btn-sm mb-3">{this.state.rows.length === 0 ? 'Add Row' : '+'}</button>}
        <span className="form-group float-right mb-3">
          <ImportCSV tableId={this.state.tableId} showErrorBanner={this.props.showErrorBanner}
                     hideErrorBanner={this.props.hideErrorBanner}
                     startNetworkTimer={this.props.startNetworkTimer}
                     stopNetworkTimer={this.props.stopNetworkTimer} updateTable={this.updateTable}/>
        </span>
        <br/><br/>
        <ExportCSV tableName={this.state.tableName} columns={this.state.columns} getSortedRows={this.getSortedRows}/>
        </div>
      </div>
    )
  }
}