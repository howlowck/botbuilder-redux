class BotReduxMiddleware {
  constructor (createStore, stateName = 'reduxState', storeName = 'reduxStore') {
    this.createStore = createStore
    this.stateName = stateName
    this.storeName = storeName
  }

  getInitialState (context) {
    return context.storage.read(['redux'])
      .then(storState => {
        if (Object.getOwnPropertyNames(storState).length === 0) {
          return null
        }
        delete storState.redux.eTag // removes eTag
        return storState.redux
      })
  }

  contextCreated (context) {
    return this.getInitialState(context)
      .then(stateFromStorage => {
        context[this.storeName] = this.createStore(stateFromStorage)
      })
  }

  postActivity (context, activities) {
    const state = context[this.storeName].getState()
    return context.storage.write({
      redux: {
        ...state,
        eTag: '*'
      }
    })
  }
}

module.exports = BotReduxMiddleware
