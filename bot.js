const slack = require("slack")
const assert = require("assert")
const config = require('./config.json')
const _ = require('lodash')

const channel = process.env.channel
const time = process.env.timeMin
const rest = config.options
const token = process.env.token

module.exports.run = function() {
  const bot = slack.rtm.client()
  bot.hello(message => {
    if(message.type != "hello"){
      console.log("Not Able to Connect")
      bot.close()
      process.exit(1)
    }
    else{
      console.log("Connected")
      postInit()
      return true
    }
  })
  bot.listen({token})
}

function postInit(){
  let text = "Que tipo de spoleto vamos comer hoje? \n"
  + " As opções são: "
  + Object.keys(rest).map((result) => {
    return "\n " + "[:" +rest[result].emoji + ":] " + rest[result].name
  })
  + " \n Muitos lugares para escolher, Votem!"

  slack.chat.postMessage({token,
    channel, 
    text, 
    as_user: false, 
    username: "Chefinho do almoço", 
    icon_emoji: ":hocho:"}, 
    (err, data) => {
      if (err){
        console.error(err)
        bot.close()
        return false
      }
      console.log("Posted at: ", data.ts)
      if (data.ok){
        react(data.ts)
        setTimeout(check, config.timeMin*60*1000, data.ts)
      }
      return true
    })
}


var react = (time) => {
  Object.keys(rest).map((result)=>{
    let name = rest[result].emoji
    let timestamp = time
    slack.reactions.add({token, 
      name, 
      channel, 
      timestamp}, 
      (err, emoji) => {
        if (err){
          console.error(err)
          bot.close()
          process.exit(1)
        }
        return true
      })
  })
}

var check = (time) => {
  let timestamp = time
  slack.reactions.get({token, 
    channel, 
    timestamp}, 
    (err, answer) => {
      if (err) {
        console.error(err)
      }
      console.log("Get Reactions")
      let reactions = answer.message.reactions
      
      if(Object.keys(rest).length != Object.keys(reactions).length) {
        console.error("Not All Reactions")
        return
      }

      let response = getBestOnes(reactions)
            
      if(response.length != 1){ 
        let text = 'É um empate entre: ' 
        + response.map((item) => {
          return "\n [:" + item.name + ":]" + _.find(rest, ['emoji', item.name]).name
        })

        slack.chat.postMessage({
          token, 
          channel, 
          text, 
          as_user: false, 
          username: "Chefinho do almoço", 
          icon_emoji: ":hocho:"}, 
          (err, data) => {
            if (err){
              console.error(err)
              bot.close()
              process.exit(1)
            }
            if (!data.ok) {
              console.error("Message not Sent")
              return 
            }
            console.log("Draw")
            randomChoose(response.map((item) => {
              return _.find(rest, ['emoji', item.name]).name
            }))
          })
          return true
      }
      
      let text = "E o vencedor é: "
      +"\n [:"
      + response[0].name 
      + ":]" 
      + _.find(rest, ['emoji', response[0].name]).name 
      + "\n Vamos lá!!"

      slack.chat.postMessage({token,
      channel, 
      text, 
      as_user: false, 
      username: "Chefinho do almoço", 
      icon_emoji: ":hocho:"}, 
      (err, data) => {
        if (err){
          console.error(err)
          bot.close()
        }
        console.log("Winner")
        randomChoose(_.find(rest, ['emoji', response[0].name]).name)                                                                                                                                                      
        return true
      })
  return true
  })

}

var randomChoose = (answers) => {
  
  if(_.isArray(answers)){
    let escolha = getRandomInt(0, answers.length - 1)

    var text = "Minha sugestão é: " 
    + " [:" 
    +_.find(rest, ['name', answers[escolha]]).emoji
    + ":] "
    + answers[escolha]
  }
  if(answers == "Random"){
    let options = _.map(rest, 'name', (o) => {
      return o
    })
    let escolha = getRandomInt(0, Object.keys(rest).length - 1)
    var text = "Minha sugestão é: " 
    + " [:" 
    +_.find(rest, ['name', options[escolha]]).emoji
    + ":] "
    + options[escolha]
  }
    if(text != null){
      slack.chat.postMessage({
        token, 
        channel, 
        text, 
        as_user: false, 
        username: "Chefinho do almoço", 
        icon_emoji: ":hocho:"}, 
        (err, data) => {
          if (err){
            console.error(err)
            bot.close()
            process.exit(1)
          }
          console.log("Sugesting")
          return true
      })
    }
}


function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getBestOnes(reactions) {
  let sorted = _.sortBy(reactions, 'count')
  return _.filter(sorted,{'count':sorted[sorted.length-1].count})
}

function testFilter() {
  
  let input = [ 
    { name: 'flag-cn', count: 1 },
    { name: 'game_die', count: 1 },
    { name: 'meat_on_bone', count: 1 },
    { name: 'older_woman::skin-tone-3', count: 1 },
    { name: 'spaghetti', count: 1 }
  ]

  let output = getBestOnes(input)

  let expected = [
    { name: 'flag-cn', count: 1 },
    { name: 'game_die', count: 1 },
    { name: 'meat_on_bone', count: 1 },
    { name: 'older_woman::skin-tone-3', count: 1 },
    { name: 'spaghetti', count: 1 }
  ]

  assert.deepEqual(output, expected)
}

//run()
// testFilter()