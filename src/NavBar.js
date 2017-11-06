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
        <nav className="navbar navbar-expand-md bg-light">
          <a className="navbar-brand" href="/">Contacts</a>
        </nav>
      )
    } else {
      return (
        <nav className="navbar navbar-expand-md bg-light">
          <a className="navbar-brand" href="/">Contacts</a>
          <div className="navbar-nav">
            <NavLink className="nav-link nav-item" activeClassName="active" to="/main">Home</NavLink>
            <NavLink className="nav-link nav-item" activeClassName="active" to="/about">About</NavLink>
            <a onClick={this.logout} className="nav-link nav-item" href="/">Logout</a>
          </div>
        </nav>
      )
    }
  }
}