import React from 'react'

export default class TableNameListItem extends React.Component {

  onClickView = (e) => {
    e.stopPropagation();
    this.props.history.push('/tables/' + this.props.table._id)
  }

  render() {
    return (
      <li onClick={this.onClickView} className="list-group-item">{this.props.table.tableName}</li>

    )
  }
}
