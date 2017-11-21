const { Bot, MemoryStorage } = require('botbuilder-core')
const { BotFrameworkAdapter } = require('botbuilder-services')
const { get } = require('lodash')
const { BotReduxMiddleware, getStore, IncomingMessageReduxMiddleware, defaultRenderer } = require('../../src')
const restify = require('restify')
const createStore = require('./createStore')
const fetch = require('node-fetch')

var remotedev = require('remotedev-server') // if you see a weird Compilation error: https://github.com/uNetworking/uWebSockets/pull/526/files
remotedev({ hostname: 'localhost', port: 8100 })

// Create server
let server = restify.createServer()
server.listen(process.env.port || 3978, () => {
  console.log(`${server.name} listening to ${server.url}`)
})

// Create connector
const adapter = new BotFrameworkAdapter({ appId: process.env.MICROSOFT_APP_ID, appPassword: process.env.MICROSOFT_APP_PASSWORD })
server.post('/api/messages', adapter.listen())

class Conversation {
  constructor (convoName, store) {
    this.convoName = convoName
    this.store = store
    this.questions = {}
  }

  ask (message, type) {
    const {getState, dispatch} = this.store

    if (!this.questions[type]) {
      this.questions[type] = type => type
    }

    if (!(getState().requesting)) { // if state is not requesting anything
      dispatch({type: 'SEND_TEXT', data: message})
      dispatch({type: 'ASK', data: type})
      return
    }

    if (getState().requesting === type) { // if state is requesting this ask type (question)
      dispatch({type: 'ANSWERED'})
      return getState().incomingMessage
    }

    return get(getState(), type)
  }

  reply (message) {
    const {dispatch} = this.store
    if (message) {
      dispatch({type: 'SEND_TEXT', data: message})
    }
  }
}

function text (strings, ...keys) { // tagged template literal
  if (keys.includes(undefined)) {
    return null
  }

  const str = strings.reduce((prev, current, index) => {
    return prev + current + (keys[index] || '') // keys will always have one less than strings
  }, '')

  return str
}

const infoRequest = (context) => {
  const store = getStore(context)
  const convo = new Conversation('info', store)
  const name = convo.ask('Hi, whats your name?', 'info.name')
  const email = convo.ask('Whats your email?', 'info.email')
  const birthday = convo.ask('Whats your birthday?', 'info.bd')
  convo.reply(text`Nice! now I have your name ${name}, Email: ${email}, Birthday: ${birthday}`)
  return Promise.resolve()
}

const bookFlightTopic = async (context) => {
  const store = getStore(context)
  const convo = new Conversation('flight', store)
  const dest = convo.ask('Where would you like to go?', 'flight.destination')
  const depart = convo.ask('When would you depart?', 'flight.departDate')
  const ret = convo.ask('When would you return?', 'flight.returnDate')
  if (dest && depart && ret) {
    // Book the flight
    const confirmationObj = await fetch('https://baconipsum.com/api/?type=all-meat&sentences=1&start-with-lorem=1').then(res => res.json())
    const confirmationText = confirmationObj[0]
    convo.reply(`Ok! Your flight is booked!`)
    convo.reply(`Your bacon-loving agent says: ${confirmationText}`)
  }
}

// Initialize bot
const bot = new Bot(adapter)
    .use(new MemoryStorage())
    .use(new BotReduxMiddleware(createStore))
    .use(new IncomingMessageReduxMiddleware())

bot.onReceive(context => {
  if (context.request.type !== 'message') {
    return
  }

  let currentTopic
  const state = getStore(context).getState()
  const currentInfoKeys = Object.getOwnPropertyNames(get(state, 'info', {}))

  if (
      currentInfoKeys.includes('name') &&
      currentInfoKeys.includes('email') &&
      currentInfoKeys.includes('bd')
    ) {
    // all the information is gathered
    currentTopic = bookFlightTopic(context)
  } else {
    currentTopic = infoRequest(context)
  }

  return currentTopic.then(() => {
    defaultRenderer(context, getStore(context))
  })
})
