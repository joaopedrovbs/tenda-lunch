const slack = require("slack")
const assert = require("assert")
const config = require('./config.json')
const _ = require('lodash')

const bot = slack.rtm.client()
const token = config.token
const channel = config.channel
const time = config.time
const rest = config.options

var postInit = () => {
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
      }
      console.log("Posted at: ", data.ts)
      react(data.ts)
      setTimeout(check, config.timeMin*60*1000, data.ts)
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
    
      let reactions = answer.message.reactions
      
      if(Object.keys(rest).length != Object.keys(reactions).length) {
        console.error("Not All Reactions")
        bot.close()
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
            bot.close()
            if (!data.ok) {
              console.error("Message not Sent")
              return
            }
            randomChoose(response.map((item) => {
              return _.find(rest, ['emoji', item.name]).name
            }))
          })
          return
      }
      
      let text = "E o vencedor é: "
      +"\n [:"
      + response[0].name 
      + ":]" 
      + _.find(rest, ['emoji', response[0].name]).name 
      + "\n E já tá na Hora!!"

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
        //Here goes new
        randomChoose(_.find(rest, ['emoji', response[0].name]).name)
        bot.close()      
      })
  })

}

var randomChoose = (answers) => {
  if(!_.isArray(answers)){
    if(answers == "Random"){
      let options = _.map(rest, 'name', (o) => {
        return o
      })
      console.log(options[getRandomInt(0, Object.keys(rest).length - 1)])
      return
    }
    
  }
    let escolha = getRandomInt(0, answers.length - 1)
    
    let text = "Minha sugestão é: " 
    + " [:" 
    +_.find(rest, ['name', answers[escolha]]).emoji
    + ":] "
    + answers[escolha]

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
        bot.close()
      })
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

function startBot() {
  bot.hello(message => {
    if(message.type = "hello"){
      console.log("Connected")
      postInit()
    }
    else{
      console.log("Not Able to Connect")
      bot.close()
      process.exit(1)
    }
  })
  bot.listen({token})
}


startBot()

// testFilter()