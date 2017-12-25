import React from 'react'

import ImportCSV from './ImportCSV'
import ExportCSV from "./ExportCSV"

export default class TableDetail extends React.Component {
  render() {
    return (
      <div className="margin-small" hidden={this.props.hidden}>
        {this.props.columns.length === 0 ? '' : <button onClick={this.props.addNewRow}
                                                        className="btn btn-primary btn-sm mb-3">{this.props.rows.length === 0 ? 'Add Row' : '+'}</button>}
        <span className="form-group float-right mb-3">
          <ImportCSV tableId={this.props.tableId} showErrorBanner={this.props.showErrorBanner}
                     hideErrorBanner={this.props.hideErrorBanner}
                     startNetworkTimer={this.props.startNetworkTimer}
                     stopNetworkTimer={this.props.stopNetworkTimer} updateTable={this.props.updateTable}/>
        </span>
        <br/><br/>
        <ExportCSV tableName={this.props.tableName} columns={this.props.columns}
                   getSortedRows={this.props.getSortedRows}/>
      </div>
    )
  }
}