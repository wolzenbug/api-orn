const express = require('express')
const app = express()
const port = 3000

app.use('/static', express.static(__dirname + '/assets'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/html/index.html')
})

app.get('/training', (req, res) => {
  res.sendFile(__dirname + '/html/training.html')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
