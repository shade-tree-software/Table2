import React from 'react'

export default class TableDetail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {csvFilename: '', submitButtonText: 'Upload'}
  }


  setFileInput = (input) => {
    this.fileInput = input
  }

  setSubmitButton = (button) => {
    this.submitButton = button
  }

  setCSVFilename = (e) => {
    this.setState({csvFilename: e.target.value})
  }

  clickFileInput = () => {
    this.fileInput.click()
  }

  onSubmit = (e) => {
    e.preventDefault()
    this.setState({submitButtonText: 'Uploading...'})
    let file = this.fileInput.files[0];
    const reader = new FileReader();
    reader.onload = this.uploadFile;
    reader.readAsText(file);
  }

  uploadFile = (e) => {
    fetch(`/api/tables/${this.props.tableId}/csv?token=${localStorage.authToken}`, {
      method: 'post',
      body: e.currentTarget.result
    }).then((response) => {
      this.setState({submitButtonText: 'Upload'})
      if (response.ok) {
        this.props.hideErrorBanner()
      } else {
        throw new Error(response.statusText)
      }
      return response.json()
    }).then(this.props.updateTable).catch((err) => {
      this.setState({submitButtonText: 'Upload'})
      this.props.showErrorBanner(`Unable to upload file (${err.message})`)
    })
  }

  render() {
    return (
      <form onSubmit={this.onSubmit} method="POST">
        <input ref={this.setFileInput} onChange={this.setCSVFilename} type="file" name="csvFiles[]" className="file"/>
        <span className="btn-toolbar">
          <span className="btn-group">
            <span className="input-group">
              <span className="input-group-addon">Import CSV</span>
              <input type="text" className="form-control" onClick={this.clickFileInput} placeholder="Choose file..."
                     value={this.state.csvFilename.replace(/C:\\fakepath\\/i, '')}/>
              <span className="input-group-btn">
                <button className="btn btn-primary" onClick={this.clickFileInput} type="button">Browse</button>
              </span>
            </span>
          </span>
          <span className="btn-group">
            <button className="btn btn-primary ml-sm-1" disabled={this.state.csvFilename.length < 1}
                    ref={this.setSubmitButton}
                    type="submit">{this.state.submitButtonText}</button>
          </span>
        </span>
      </form>
    )
  }
}