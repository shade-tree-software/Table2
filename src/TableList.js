import React from 'react'

import TableListItem from './TableListItem'

export default class TableList extends React.Component {
  render() {
    let listItems =
      this.props.tables.map((table) =>
        <TableListItem key={table._id}
                       history={this.props.history}
                       table={table}/>
      )
    return (
      <div>
        <h3>Tables</h3>
        <ul className="list-group">
          {listItems}
        </ul>
      </div>
    )
  }
}
