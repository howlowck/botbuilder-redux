
class IncomingMessageReduxMiddleware {
  constructor (storeName = 'reduxStore') {
    this.storeName = storeName
  }
  contextCreated (context) {
    context[this.storeName].dispatch({type: 'INCOMING_MESSAGE', data: context.request})
  }
}

module.exports = IncomingMessageReduxMiddleware
