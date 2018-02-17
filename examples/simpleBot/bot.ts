import { Bot, MemoryStorage } from 'botbuilder'
import { BotFrameworkAdapter } from 'botbuilder-services'
import { createStore, Reducer as ReduxReducer, AnyAction, Store as ReduxStore, StoreCreator } from 'redux'
import { set, get } from 'lodash'
import BotReduxMiddleware, { getStore } from '../../src'
const restify = require('restify')

namespace State {
  export type Responses = string[]
  export type Requesting = string | null

  export interface All {
    responses: Responses,
    requesting: Requesting
  }
}

type StoreCreatorFromStorage<S> =  (stateFromStorage: S) => ReduxStore<S>

// Create server
let server = restify.createServer()
server.listen(process.env.port || 3978, () => {
  console.log(`${server.name} listening to ${server.url}`)
})

// Create connector
const adapter = new BotFrameworkAdapter(
  { appId: process.env.MICROSOFT_APP_ID, appPassword: process.env.MICROSOFT_APP_PASSWORD }
)
server.post('/api/messages', adapter.listen())

// const middlewareProp = Symbol('myDialog')
// Initialize bot

type Reducer = ReduxReducer<State.All>

const reducer: Reducer = (prevState: State.All, action: AnyAction) : State.All => {
  /*
    In this reducer, the intended state shape looks like this:
    {
      requesting: string|null, // the name in dot notation, once the user answers, is set by lodash using the name
      responses: array<string|RichMedia|AdaptiveCard>, //the list of responses to be "rendered" by the renderer
      info: {
        name: string // the value is set by lodash (line 37)
      }
    }
  */
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

const storeCreator: StoreCreatorFromStorage<State.All> = (stateFromStorage: State.All) => {
  const defaultState: State.All = {requesting: null, responses: []}
  return createStore(reducer, stateFromStorage || defaultState)
}

new Bot(adapter)
    .use(new MemoryStorage())
    .use(new BotReduxMiddleware<State.All>(storeCreator))
    .onReceive((context: BotContext) => {
      if (context.request.type !== 'message') {
        return
      }

      const {dispatch, getState} = getStore<State.All>(context)

      dispatch({type: 'CLEAR_RESPONSES'})
      dispatch({type: 'INCOMING_MESSAGE', data: context.request.text})

      if (!get(getState(), 'info.name')) {
        dispatch({type: 'SEND_TEXT', data: `What is Your name?`})
        dispatch({type: 'ASK', data: 'info.name'})
      } else {
        const name = get(getState(), 'info.name')
        dispatch({type: 'SEND_TEXT', data: `Hello ${name}!`})
      }

      const responses  = getState().responses
      if ( ! responses) {
        return Promise.resolve()
      }

      responses.forEach((response: string) => {
        context.reply(response)
      })
    }
)
