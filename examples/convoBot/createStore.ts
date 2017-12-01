import { createStore, applyMiddleware, AnyAction, Store as ReduxStore} from 'redux'
import { set } from 'lodash'
const { composeWithDevTools } = require('remote-redux-devtools')

const composeEnhancers = composeWithDevTools({ realtime: true, port: 8100 })

export type Store = ReduxStore<State.All>

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

const reducer = (prevState: State.All, action: AnyAction) => {
  if (action.type === 'INCOMING_MESSAGE') {
    return {...prevState, incomingMessage: action.data}
  }

  if (action.type === 'ASK') {
    return {...prevState, requesting: action.data} // for example: info.name
  }

  if (action.type === 'ANSWERED' && prevState.requesting !== null) {
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

  return prevState
}

export default (stateFromStorage: State.All) => {
  const defaultState: State.All = {
    incomingMessage: null,
    requesting: '',
    responses: []
  }
  return createStore(reducer, stateFromStorage || defaultState, composeEnhancers(applyMiddleware()))
}
