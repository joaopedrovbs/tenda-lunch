const slack = require("slack")
const assert = require("assert")
const config = require('./config.json')
const _ = require('lodash')



module.exports.run = function () {

const bot = slack.rtm.client()
const token = config.token
const channel = config.channel
const time = config.time
const rest = config.options
  
bot.hello(message=>{
  if (message.type != "hello") {
    console.log("Error")
  }
  console.log("Go On!")
  setTimeout(function(){
    bot.close()
  }, 3000);
})

bot.listen({token})

}