const BotReduxMiddleware = require('./BotReduxMiddleware')
const IncomingMessageReduxMiddleware = require('./IncomingMessageReduxMiddleware')

function getStore (ctx, storeProp = 'reduxStore') {
  return ctx[storeProp]
}

function defaultRenderer (ctx, store) {
  store.getState().responses.forEach((response) => {
    console.log(response)
    ctx.reply(response)
  })
}

module.exports = {
  BotReduxMiddleware,
  IncomingMessageReduxMiddleware,
  getStore,
  defaultRenderer
}
