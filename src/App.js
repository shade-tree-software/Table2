import React, { Component } from 'react';
import {BrowserRouter as Router, Route, Redirect} from 'react-router-dom'

import './App.css';
import './vendor/bootstrap.css'

import NavBar from './NavBar'
import MainPage from './MainPage'
import About from './About'
import LoginForm from './LoginForm'

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Route path="/" component={NavBar}/>
          <div className="container">
            <Route exact path="/" render={(props) => (
              sessionStorage.authToken ? <MainPage {...props}/> : <Redirect to="/login"/> )}/>
            <Route path="/login" component={LoginForm}/>
            <Route path="/main" render={(props) => (
              sessionStorage.authToken ? <MainPage {...props}/> : <Redirect to="/login"/> )}/>
            <Route path="/about" render={() => (
              sessionStorage.authToken ? <About/> : <Redirect to="/login"/> )}/>
          </div>
        </div>
      </Router>
    )
  }
}

export default App;
