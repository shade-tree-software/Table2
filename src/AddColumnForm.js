import React from 'react'

export default class AddColumnForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {columnName: this.props.initialColumnName || ''}
  }

  okHandler = (e) => {
    e.preventDefault()
    let columnName = this.state.columnName
    this.setState({columnName: ''})
    this.props.onOk(columnName)
  }

  changeHandler = (e) => {
    this.setState({columnName: e.target.value})
  }

  cancelHandler = (e) => {
    this.setState({columnName: ''})
    this.props.onCancel()
  }



  render() {
    return (
      <form className="form-inline" onSubmit={this.okHandler}>
        <input className="mx-sm-1" autoFocus type="text" onChange={this.changeHandler} placeholder="Column Name"
               defaultValue={this.state.columnName}/>
        <button onClick={this.okHandler} type="button" className="mx-sm-1 btn btn-primary btn-sm">OK</button>
        <button onClick={this.cancelHandler} type="button" className="mx-sm-1 btn btn-primary btn-sm">Cancel</button>
      </form>
    )
  }
}