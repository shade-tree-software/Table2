import React from 'react'

export default class About extends React.Component {
  constructor(props){
    super(props)
    this.state = {version: ''}
  }

  componentDidMount(){
    this.props.startNetworkTimer()
    fetch('api/version?token=' + localStorage.authToken).then((response) => {
      this.props.stopNetworkTimer()
      if (response.ok) {
        this.props.hideErrorBanner()
      } else {
        throw new Error(response.statusText)
      }
      return response.json()
    }).then((data) => {
      this.setState({version: data.version})
    }).catch((err) => {
      this.props.showErrorBanner(`Unable to get version info from server (${err.message})`)
    })
  }

  render() {
    return (
      <div>
        <h1>About</h1>
        <p>version {this.state.version}</p>
      </div>
    )
  }
}