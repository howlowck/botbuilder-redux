const { createStore, applyMiddleware } = require('redux')
const { set } = require('lodash')
const { composeWithDevTools } = require('remote-redux-devtools')

const composeEnhancers = composeWithDevTools({ realtime: true, port: 8100 })

const defaultState = {
  incomingMessage: '',
  requesting: null,
  responses: []
}

const reducer = (prevState, action) => {
  if (action.type === 'INCOMING_MESSAGE') {
    return {...prevState, incomingMessage: action.data}
  }

  if (action.type === 'ASK') {
    return {...prevState, requesting: action.data} // for example: info.name
  }

  if (action.type === 'ANSWERED') {
    const requestPath = prevState.requesting
    const newState = {...prevState, requesting: null}
    const data = action.data || prevState.incomingMessage
    return set(newState, requestPath, data)
  }

  if (action.type === 'SEND_TEXT') {
    return {...prevState, responses: [...prevState.responses, action.data]}
  }

  if (action.type === 'CLEAR_RESPONSES') {
    return {
      ...prevState,
      responses: []
    }
  }

  return {...prevState}
}

module.exports = (stateFromStorage) => {
  return createStore(reducer, stateFromStorage || defaultState, composeEnhancers(applyMiddleware()))
}
