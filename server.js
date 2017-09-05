const bot = require('./bot')
const express = require('express')
const app = express()

app.post('/api', function (req, res) {
  res.send('Hello World!')
  bot.run()
})

app.get('/favicon.ico', function(req, res) {
    console.log("No favicon")
    res.status(404);
});

app.listen(80, function () {
  console.log('Example app listening on port 80!')
})
