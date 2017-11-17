const { Bot, BotStateManager, MemoryStorage } = require('botbuilder-core')
const { BotFrameworkAdapter } = require('botbuilder-services')
const { set, get } = require('lodash')
const { BotReduxMiddleware, getStore, IncomingMessageReduxMiddleware, defaultRenderer } = require('../../src')
const restify = require('restify')
const { composeWithDevTools } = require('remote-redux-devtools') // if you see a weird Compilation error: https://github.com/uNetworking/uWebSockets/pull/526/files
const remotedev = require('remotedev-server')
remotedev({ hostname: 'localhost', port: 8100 })

// Create server
let server = restify.createServer()
server.listen(process.env.port || 3978, () => {
  console.log(`${server.name} listening to ${server.url}`)
})

// Create connector
const adapter = new BotFrameworkAdapter({ appId: process.env.MICROSOFT_APP_ID, appPassword: process.env.MICROSOFT_APP_PASSWORD })
server.post('/api/messages', adapter.listen())

// Initialize bot
const reducer = (prevState, action) => {
  if (action.type === 'INCOMING_MESSAGE') {
    if (action.data.text === 'nevermind') {
      return {...prevState, requesting: null, responses: ['ok..']}
    }

    if (prevState.requesting) { // if we are requesting something then we can use lodash set to put it in our state
      return set({...prevState}, prevState.requesting, action.data.text)
    }

    return {...prevState}
  }

  if (action.type === 'ASK') {
    return {...prevState, requesting: action.data} // for example: info.name
  }

  if (action.type === 'SEND_TEXT') {
    return {...prevState, requesting: null, responses: [...prevState.responses, action.data]}
  }

  if (action.type === 'CLEAR_RESPONSES') {
    return {
      ...prevState,
      responses: []
    }
  }

  return {...prevState}
}

const composeEnhancers = composeWithDevTools({ realtime: true, port: 8100 })

const bot = new Bot(adapter)
    .use(new MemoryStorage())
    .use(new BotStateManager())
    .use(new BotReduxMiddleware(reducer, null, composeEnhancers))
    .use(new IncomingMessageReduxMiddleware())
    .onReceive(context => {
      if (context.request.type !== 'message') {
        return
      }
      const store = getStore(context)

      if (!get(store.getState(), 'info.name')) {
        console.log('here!!')
        store.dispatch({type: 'SEND_TEXT', data: `What is Your name?`})
        store.dispatch({type: 'ASK', data: 'info.name'})
      } else {
        const name = get(store.getState(), 'info.name')
        store.dispatch({type: 'SEND_TEXT', data: `Hello ${name}!`})
      }

      defaultRenderer(context, store)
    })
