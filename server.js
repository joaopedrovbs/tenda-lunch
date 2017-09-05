const bot = require('./bot')
const express = require('express')
const app = express()

var port = process.env.PORT || 3000

app.post('/api', function (req, res) {
  res.send('Hello World!')
  bot.run()
})

app.get('/favicon.ico', function(req, res) {
    console.log("No favicon")
    res.status(404);
});

app.listen(port, function () {
  console.log('Example app listening on port: ', port)
})
