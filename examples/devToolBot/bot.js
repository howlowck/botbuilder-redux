const { Bot, MemoryStorage } = require('botbuilder-core')
const { BotFrameworkAdapter } = require('botbuilder-services')
const { get } = require('lodash')
const { BotReduxMiddleware, getStore, IncomingMessageReduxMiddleware, defaultRenderer } = require('../../src')
const restify = require('restify')
const createStore = require('./createStore')

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

// Initialize bot
const bot = new Bot(adapter)
    .use(new MemoryStorage())
    // .use(new BotStateManager()) // Does NOT Require State Manager
    // .use(new BotReduxMiddleware(reducer, null, composeEnhancers))
    .use(new BotReduxMiddleware(createStore))
    .use(new IncomingMessageReduxMiddleware())
    .onReceive(context => {
      if (context.request.type !== 'message') {
        return
      }
      const {dispatch, getState} = getStore(context)

      if (!get(getState(), 'info.name')) {
        dispatch({type: 'SEND_TEXT', data: `What is Your name?`})
        dispatch({type: 'ASK', data: 'info.name'})
      } else {
        const name = get(getState(), 'info.name')
        dispatch({type: 'SEND_TEXT', data: `Hello ${name}!`})
      }

      defaultRenderer(context, getStore(context))
    })
