import React from 'react'

export default class NewTableForm extends React.Component {
  static defaultState = {tableName: ''}

  constructor(props) {
    super(props)
    this.state = NewTableForm.defaultState
  }

  submitHandler = (e) => {
    e.preventDefault();
    this.props.addNewTable(this.state.tableName)
    this.setState(NewTableForm.defaultState)
  }

  changeHandler = (e) => {
    this.setState({[e.target.name]: e.target.value})
  }

  render() {
    return (
        <form onSubmit={this.submitHandler}>
          <div className="row">
            <div className="col-lg-3 col-md-4 col-sm-5">
              <input name="tableName"
                     className="form-control"
                     placeholder="Table Name"
                     value={this.state.tableName}
                     onChange={this.changeHandler}/><br/>
            </div>
            <div className="col-lg-3 col-md-4 col-sm-5">
              <button type="submit"
                      className="btn btn-primary float-right">Add
              </button>
            </div>
          </div>
        </form>
    )
  }
}
