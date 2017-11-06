import React from 'react'

export default class LoginForm extends React.Component {
  static defaultState = {username: '', password: ''}

  constructor(props) {
    super(props)
    this.state = LoginForm.defaultState
  }

  submitHandler = (e) => {
    e.preventDefault();
    this.setState(LoginForm.defaultState)
    fetch('api/authenticate', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'post',
      body: JSON.stringify(this.state)
    }).then((response) => {
      return response.json()
    }).then((data) => {
      sessionStorage.authToken = data.token
      this.props.history.push('/main')
    })
  }

  changeHandler = (e) => {
    this.setState({[e.target.name]: e.target.value})
  }

  render() {
    return (
      <form onSubmit={this.submitHandler}>
        <br/>
        <div className="row">
          <div className="col-lg-3 col-md-4 col-sm-5">
            <input name="username"
                   className="form-control"
                   placeholder="username"
                   value={this.state.username}
                   onChange={this.changeHandler}/><br/>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-3 col-md-4 col-sm-5">
            <input name="password"
                   type="password"
                   className="form-control"
                   placeholder="password"
                   value={this.state.password}
                   onChange={this.changeHandler}/><br/>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-3 col-md-4 col-sm-5">
            <button type="submit"
                    className="btn btn-primary float-right">Login
            </button>
          </div>
        </div>
      </form>
    )
  }
}
