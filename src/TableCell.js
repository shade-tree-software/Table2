import React from 'react'

import TextBoxForm from './TextBoxForm'

export default class TableCell extends React.Component {
  constructor(props) {
    super(props)
    this.state = {editing: false}
  }

  okHandler = (newText) => {
    this.setState({editing: false})
    console.log(newText)
  }

  cancelHandler = (e) => {
    this.setState({editing: false})
  }

  onCellClick = (e) => {
    this.setState({editing: true})
  }

  render() {
    if (this.state.editing) {
      return (
        <td>
          <TextBoxForm initialText={this.props.text} onOk={this.okHandler} onCancel={this.cancelHandler}/>
        </td>
      )
    } else {
      return (
        <td onClick={this.onCellClick}>{this.props.text}</td>
      )
    }
  }
}