import React from 'react'

import NewTableForm from './NewTableForm'
import TableList from './TableList'

export default class MainPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {tables: []}
  }

  componentDidMount() {
    this.getTables()
    this.timerId = setInterval(this.getTables, 10000)
  }

  componentWillUnmount() {
    clearInterval(this.timerId);
  }

  getTables = () => {
    fetch('api/tables?token=' + localStorage.authToken).then((response) => {
      return response.json()
    }).then((data) => {
      this.setState({tables: data})
    })
  }

  addNewTable = (tableName) => {
    fetch('api/tables?token=' + localStorage.authToken, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'post',
      body: JSON.stringify({tableName})
    }).then(this.getTables)
  }

  deleteTable = (_id) => {
    fetch('api/tables/' + _id + '?token=' + localStorage.authToken, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'delete'
    }).then(this.getTables)
  }

  render() {
    return (
      <div>
        <br/>
        <NewTableForm addNewTable={this.addNewTable}/>
        <br/>
        <br/>
        <TableList history={this.props.history} tables={this.state.tables}/>
      </div>
    )
  }
}
