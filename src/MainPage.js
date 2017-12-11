import React from 'react'

import NewTableForm from './NewTableForm'
import TableList from './TableList'

export default class MainPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {tables: []}
  }

  componentDidMount() {
    this.props.startNetworkTimer()
    this.getTables()
    this.timerId = setInterval(this.getTables, 10000)
  }

  componentWillUnmount() {
    clearInterval(this.timerId);
  }

  getTables = () => {
    fetch('api/tables?token=' + localStorage.authToken).then((response) => {
      this.props.stopNetworkTimer()
      if (response.ok) {
        this.props.hideErrorBanner()
      } else {
        throw new Error(response.statusText)
      }
      return response.json()
    }).then((data) => {
      this.setState({tables: data})
    }).catch((err) => {
      this.props.showErrorBanner(`Unable to get list of tables from server (${err.message})`)
    })
  }

  addNewTable = (tableName) => {
    this.props.startNetworkTimer()
    fetch('api/tables?token=' + localStorage.authToken, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'post',
      body: JSON.stringify({tableName})
    }).then((response) => {
      this.props.stopNetworkTimer()
      if (response.ok) {
        this.props.hideErrorBanner()
      } else {
        throw new Error(response.statusText)
      }
      this.getTables()
    }).catch((err) => {
      this.props.showErrorBanner(`Unable to add new table to server (${err.message})`)
    })
  }

  onTableDeleted = (tableId) => {
    // TODO: figure out what to do if another session is currently viewing this table
    clearInterval(this.timerId);
    let index = this.state.tables.findIndex((table) => (table._id === tableId))
    this.setState((prevState) => ({tables: [...prevState.tables.slice(0, index), ...prevState.tables.slice(index + 1)]}))
    this.timerId = setInterval(this.getTables, 10000)
  }

  render() {
    return (
      <div>
        <br/>
        <NewTableForm addNewTable={this.addNewTable}/>
        <br/>
        <br/>
        <TableList history={this.props.history} tables={this.state.tables}
                   showErrorBanner={this.props.showErrorBanner} hideErrorBanner={this.props.hideErrorBanner}
                   startNetworkTimer={this.props.startNetworkTimer} stopNetworkTimer={this.props.stopNetworkTimer}
                   onTableDeleted={this.onTableDeleted}/>
      </div>
    )
  }
}
