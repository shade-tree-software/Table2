import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Redirect} from 'react-router-dom'
import Modal from 'react-modal';

import './App.css';
import './vendor/bootstrap.css'

import NavBar from './NavBar'
import MainPage from './MainPage'
import About from './About'
import LoginForm from './LoginForm'
import TableDetail from './TableDetail'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {errorBannerMessage: '', hideErrorBanner: true, pleaseWait: false}
  }

  showErrorBanner = (errorMessage) => {
    this.setState({errorBannerMessage: errorMessage, hideErrorBanner: false})
  }

  hideErrorBanner = () => {
    this.setState({hideErrorBanner: true})
  }

  setPleaseWait = (show) => {
    this.setState({pleaseWait: show})
  }

  onNetworkDelay = () => {
    this.setPleaseWait(true)
  }

  startNetworkTimer = () => {
    this.networkTimer = setTimeout(this.onNetworkDelay, 250)
  }

  stopNetworkTimer = () => {
    clearTimeout(this.networkTimer)
    this.setPleaseWait(false)
  }

  render() {
    return (
      <Router>
        <div>
          <Route path="/" component={NavBar}/>
          <div className="container">
            <Modal isOpen={this.state.pleaseWait} onRequestClose={() => (this.setPleaseWait(false))}
                   contentLabel="Please Wait"
                   style={{content: {display: 'inline-block', right: 'unset', bottom: 'unset'}}}>
              <p>Please wait...</p>
            </Modal>
            <div className="alert alert-danger" role="alert" hidden={this.state.hideErrorBanner}>
              {this.state.errorBannerMessage}
            </div>
            <Route exact path="/" render={(props) => (
              localStorage.authToken ? <MainPage showErrorBanner={this.showErrorBanner}
                                                 hideErrorBanner={this.hideErrorBanner}
                                                 startNetworkTimer={this.startNetworkTimer}
                                                 stopNetworkTimer={this.stopNetworkTimer} {...props}/> :
                <Redirect to="/login"/> )}/>
            <Route path="/login" render={(props) => (<LoginForm showErrorBanner={this.showErrorBanner}
                                                                hideErrorBanner={this.hideErrorBanner}
                                                                startNetworkTimer={this.startNetworkTimer}
                                                                stopNetworkTimer={this.stopNetworkTimer} {...props}/> )}/>
            <Route path="/main" render={(props) => (
              localStorage.authToken ? <MainPage showErrorBanner={this.showErrorBanner}
                                                 hideErrorBanner={this.hideErrorBanner}
                                                 startNetworkTimer={this.startNetworkTimer}
                                                 stopNetworkTimer={this.stopNetworkTimer} {...props}/> :
                <Redirect to="/login"/> )}/>
            <Route path="/about" render={() => (
              localStorage.authToken ? <About showErrorBanner={this.showErrorBanner}
                                              hideErrorBanner={this.hideErrorBanner}
                                              startNetworkTimer={this.startNetworkTimer}
                                              stopNetworkTimer={this.stopNetworkTimer}/> : <Redirect to="/login"/> )}/>
            <Route path="/tables/:_id" render={(props) => (
              localStorage.authToken ? <TableDetail showErrorBanner={this.showErrorBanner}
                                                    hideErrorBanner={this.hideErrorBanner}
                                                    startNetworkTimer={this.startNetworkTimer}
                                                    stopNetworkTimer={this.stopNetworkTimer} {...props}/> :
                <Redirect to="/login"/>)}/>
          </div>
        </div>
      </Router>
    )
  }
}

export default App;
