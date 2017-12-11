import React from 'react'

export default class TableListItem extends React.Component {

  onClickView = (e) => {
    e.stopPropagation();
    this.props.history.push('/tables/' + this.props.table._id)
  }

  onDeleteTableClick = (e, tableId) => {
    if (window.confirm('You are about to permanently delete an entire table and all the data in the table.  You cannot undo this action.  Are you sure you want to proceed?')) {
      this.props.startNetworkTimer()
      fetch(`/api/tables/${tableId}?token=${localStorage.authToken}`, {
        method: 'delete',
      }).then((response) => {
        this.props.stopNetworkTimer()
        if (response.ok) {
          this.props.hideErrorBanner()
        } else {
          throw new Error(response.statusText)
        }
        this.props.onTableDeleted(tableId)
      }).catch((err) => {
        this.props.showErrorBanner(`Unable to delete table from server (${err.message})`)
      })
    }
  }

  render() {
    return (
      <li className="list-group-item">
        <span onClick={this.onClickView}>{this.props.table.tableName}</span>
        <button onClick={(e) => this.onDeleteTableClick(e, this.props.table._id)}
                className="btn btn-danger btn-sm float-right">X
        </button>
      </li>

    )
  }
}
