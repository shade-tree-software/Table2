import React from 'react'

export default class ExportCSV extends React.Component {

  saveCSVFileToDisk = (csvText) => {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvText));
    element.setAttribute('download', `${this.props.tableName}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  generateCSVText = () => {
    let csvText = ''
    this.props.columns.forEach((column, index) => {
      csvText += index === 0 ? '' : ','
      csvText += column.columnName
    })
    this.props.getSortedRows().forEach(([rowId, rowData]) => {
      this.props.columns.forEach((column, index) => {
        csvText += index === 0 ? '\n' : ','
        let data = rowData[column.columnId] ? rowData[column.columnId].cellText.trim() : ''
        let dataContainsCommas = data.includes(',')
        csvText += dataContainsCommas ? '"' : ''
        csvText += data
        csvText += dataContainsCommas ? '"' : ''
      })
    })
    return csvText
  }

  exportCSV = () => {
    this.saveCSVFileToDisk(this.generateCSVText())
  }

  render() {
    return (
      <button hidden={this.props.columns.length < 1} onClick={this.exportCSV}
              className="btn btn-primary ml-sm-1 float-right">Export CSV</button>
    )
  }

}