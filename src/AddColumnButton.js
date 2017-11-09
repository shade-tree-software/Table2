import React from 'react'

export default class AddColumnButton extends React.Component {
  constructor(props) {
    super(props)
    this.state = {addingColumn: false, columnName: ''}
  }

  okHandler = () => {
    let columnName = this.state.columnName
    this.setState({addingColumn: false, columnName: ''})
    fetch(`/api/tables/${this.props.tableId}/columns?token=${sessionStorage.authToken}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'post',
      body: JSON.stringify({columnName})
    }).then(this.props.onColumnAdded())
  }

  changeHandler = (e) => {
    this.setState({columnName: e.target.value})
  }

  cancelHandler = (e) => {
    this.setState({addingColumn: false, columnName: ''})
  }

  getColumnName = (e) => {
    this.setState({addingColumn: true})
  }

  render() {
    if (this.state.addingColumn) {
      return (
        <form className="form-inline">
          <input className="mx-sm-1" autoFocus type="text" onChange={this.changeHandler} placeholder="Column Name"
                 defaultValue={this.state.columnName}/>
          <button onClick={this.okHandler} type="button" className="mx-sm-1 btn btn-primary btn-sm">OK</button>
          <button onClick={this.cancelHandler} type="button" className="mx-sm-1 btn btn-primary btn-sm">Cancel</button>
        </form>
      )
    } else {
      return (
        <span>
          <button onClick={this.getColumnName} className="btn btn-primary btn-sm">Add Column</button>
        </span>
      )
    }
  }
}