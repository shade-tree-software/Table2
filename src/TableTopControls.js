import React from 'react'
import {Link} from 'react-router-dom'

export default class TableTopControls extends React.Component {
  render() {
    return (
      <div className="margin-small">
        {this.props.columns.length === 0 || this.props.rows.length < 5 ? '' :
          <button onClick={this.props.addNewRow}
                  className="btn btn-primary btn-sm mb-3 mr-3">+</button>}
        <span className="form-check d-inline">
          <label hidden={!this.props.sortingByDate || this.props.printView} className="form-check-label my-2">
            <input onChange={this.props.onColorPrefsChange} className="form-check-input" type="checkbox"
                   checked={this.props.colorCodedRows} value=""/>
            Use color-coded rows when sorting by date
          </label>
        </span>
        <Link className="float-right large-only my-2" hidden={this.props.printView}
              to={`/tables/${this.props.tableId}?printview=true`}>printer-friendly view</Link>
      </div>
    )
  }
}