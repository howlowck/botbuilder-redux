const { createStore, applyMiddleware } = require('redux')

class ReduxMiddleware {
  constructor (reducer, defaultState, middleware, storeSymbol, stateName) {
    this.reducer = reducer
    this.defaultState = defaultState || {
      requesting: null,
      received: null,
      responses: []
    }
    this.middleware = middleware || ((value) => { return value })
    this.stateName = stateName || 'reduxState'
    this.storeName = storeSymbol || 'reduxStore'
  }

  contextCreated (context) {
    const store = createStore(this.reducer, context.state.conversation[this.stateName] || this.defaultState, this.middleware(applyMiddleware()))
    context[this.storeName] = store
  }

  postActivity (context, activities) {
    context[this.storeName].dispatch({type: 'CLEAR_RESPONSES'})
    context.state.conversation[this.stateName] = context[this.storeName].getState()
  }
}

module.exports = ReduxMiddleware
