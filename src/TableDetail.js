import React from 'react'

import AddColumnButton from './AddColumnButton'

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

  render() {
    let columns = this.state.table.columns || []
    return (
      <div>
        <br/>
        <h1>{this.state.table.tableName}</h1>
        <table className="table table-hover table-responsive">
          <thead>
          <tr>
            {columns.map((column) => <th key={column.columnName}>{column.columnName}</th>)}
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