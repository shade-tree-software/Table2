import React from 'react'

import AddColumnForm from './AddColumnForm'

export default class AddColumnButton extends React.Component {
  constructor(props) {
    super(props)
    this.state = {addingColumn: false}
  }

  okHandler = (columnName) => {
    this.setState({addingColumn: false})
    this.props.insertColumn(columnName)
  }

  cancelHandler = (e) => {
    this.setState({addingColumn: false})
  }

  getColumnName = (e) => {
    this.setState({addingColumn: true})
  }

  render() {
    if (this.state.addingColumn) {
      return (
        <AddColumnForm onOk={this.okHandler} onCancel={this.cancelHandler}/>
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