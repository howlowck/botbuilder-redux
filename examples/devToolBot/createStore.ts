import { createStore, applyMiddleware, Action, AnyAction, Store as ReduxStore } from 'redux'
import { set } from 'lodash'
const { composeWithDevTools } = require('remote-redux-devtools')

const composeEnhancers = composeWithDevTools({ realtime: true, port: 8100 })

export namespace State {
  export type IncomingMessage = string | null
  export type Responses = string[]
  export type Requesting = string | null

  export interface All {
    incomingMessage: IncomingMessage,
    responses: Responses,
    requesting: Requesting
  }
}

export type Store = ReduxStore<State.All>

const defaultState: State.All = {
  incomingMessage: null,
  requesting: null,
  responses: []
}

const reducer = (prevState: State.All, action: AnyAction) => {
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

  return prevState
}

export default (stateFromStorage: State.All) => {
  return createStore(reducer, stateFromStorage || defaultState, composeEnhancers(applyMiddleware()))
}
