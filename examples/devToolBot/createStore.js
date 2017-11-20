const { createStore, applyMiddleware } = require('redux')
const { set } = require('lodash')
const { composeWithDevTools } = require('remote-redux-devtools')

const composeEnhancers = composeWithDevTools({ realtime: true, port: 8100 })

const defaultState = {
  requesting: null,
  responses: []
}

const reducer = (prevState, action) => {
  if (action.type === 'INCOMING_MESSAGE') {
    if (action.data === 'nevermind') {
      return {...prevState, requesting: null, responses: ['ok..']}
    }

    if (prevState.requesting) { // if we are requesting something then we can use lodash set to put it in our state
      const newState = set({...prevState}, prevState.requesting, action.data)
      newState.requesting = null
      return newState
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

module.exports = (stateFromStorage) => {
  return createStore(reducer, stateFromStorage || defaultState, composeEnhancers(applyMiddleware()))
}
