import React from 'react'

import TableListItem from './TableListItem'

export default class TableList extends React.Component {
  render() {
    let listItems =
      this.props.tables.map((table) =>
        <TableListItem key={table._id}
                       history={this.props.history}
                       table={table}
                       showErrorBanner={this.props.showErrorBanner}
                       hideErrorBanner={this.props.hideErrorBanner}
                       startNetworkTimer={this.props.startNetworkTimer}
                       stopNetworkTimer={this.props.stopNetworkTimer}
                       onTableDeleted={this.props.onTableDeleted}/>
      )
    return (
      <div>
        <h3 className="margin-small">Tables</h3>
        <ul className="list-group">
          {listItems}
        </ul>
      </div>
    )
  }
}
