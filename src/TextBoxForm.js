import React from 'react'

export default class TextBoxForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {textValue: this.props.initialText || ''}
  }

  okHandler = (e) => {
    e.preventDefault()
    let textValue = this.state.textValue
    this.setState({textValue: ''})
    this.props.onOk(textValue)
  }

  changeHandler = (e) => {
    this.setState({textValue: e.target.value})
  }

  cancelHandler = (e) => {
    this.setState({textValue: ''})
    this.props.onCancel()
  }


  render() {
    return (
      <form className="form-inline" onSubmit={this.okHandler}>
        <input className="mx-sm-1" autoFocus type="text" onChange={this.changeHandler}
               placeholder={this.props.placeholder || ''}
               defaultValue={this.state.textValue}/>
        <button onClick={this.okHandler} type="button" className="mx-sm-1 btn btn-primary btn-sm">OK</button>
        <button onClick={this.cancelHandler} type="button" className="mx-sm-1 btn btn-primary btn-sm">Cancel</button>
      </form>
    )
  }
}