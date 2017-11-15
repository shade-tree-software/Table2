import React from 'react'
import {NavLink} from 'react-router-dom'

export default class NavBar extends React.Component {
  logout = (e) => {
    e.preventDefault()
    sessionStorage.removeItem('authToken')
    this.props.history.push('/login')
  }

  render() {
    let path = this.props.location.pathname
    if (path === '/' || path === '/login' || path === '/login/') {
      return (
        <nav className="navbar navbar-expand-sm bg-light">
          <a className="navbar-brand" href="/">Table Two</a>
        </nav>
      )
    } else {
      return (
        <nav className="navbar navbar-light navbar-expand-sm bg-light">
          <a className="navbar-brand" href="/">Table Two</a>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
                  aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <div className="navbar-nav ml-auto">
              <NavLink className="nav-link nav-item" activeClassName="active" to="/main">Home</NavLink>
              <NavLink className="nav-link nav-item" activeClassName="active" to="/about">About</NavLink>
              <a onClick={this.logout} className="nav-link nav-item" href="/">Logout</a>
            </div>
          </div>
        </nav>
      )
    }
  }
}