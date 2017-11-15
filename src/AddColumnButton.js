import React from 'react'

import TextBoxForm from './TextBoxForm'

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
        <TextBoxForm onOk={this.okHandler} onCancel={this.cancelHandler} placeholder='Column Name'/>
      )
    } else {
      return (
        <span>
          <button onClick={this.getColumnName} className="btn btn-primary btn-sm">+</button>
        </span>
      )
    }
  }
}