import express from 'express'
const app = express()

app.use(express.static('build'))

app.get('/*', function (req, res) {
  res.sendFile('index.html', {root: __dirname})
})

let port = process.env.PORT || 9000
app.listen(port, function () {
  console.log(`Listening on port ${port}`)
})