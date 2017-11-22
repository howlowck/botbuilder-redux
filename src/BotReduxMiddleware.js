class BotReduxMiddleware {
  constructor (createStore, storeName = 'reduxStore') {
    this.createStore = createStore
    this.storeName = storeName
  }

  getInitialState (context) {
    const reduxKey = this.getReduxKey(context)
    return context.storage.read([reduxKey])
      .then(storState => {
        if (Object.getOwnPropertyNames(storState).length === 0) {
          return null
        }
        delete storState[reduxKey].eTag // removes eTag
        return storState[reduxKey]
      })
  }

  getReduxKey (context) {
    const convoRef = context.conversationReference
    return 'conversation/' + convoRef.conversation.id + '/redux'
  }

  contextCreated (context) {
    return this.getInitialState(context)
      .then(stateFromStorage => {
        context[this.storeName] = this.createStore(stateFromStorage)
      })
  }

  postActivity (context, activities) {
    const state = context[this.storeName].getState()
    const changes = {}
    changes[this.getReduxKey(context)] = {
      ...state,
      eTag: '*'
    }
    return context.storage.write(changes)
  }
}

module.exports = BotReduxMiddleware
