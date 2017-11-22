import React from 'react'

export default class About extends React.Component {
  constructor(props){
    super(props)
    this.state = {version: ''}
  }

  componentDidMount(){
    fetch('api/version?token=' + localStorage.authToken).then((response) => {
      return response.json()
    }).then((data) => {
      this.setState({version: data.version})
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