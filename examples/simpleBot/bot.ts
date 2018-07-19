import { BotFrameworkAdapter, MemoryStorage, ConversationState, StoreItem, Activity } from 'botbuilder'
import { createStore, Reducer as ReduxReducer, AnyAction, Store as ReduxStore, StoreCreator } from 'redux'
import { set, get } from 'lodash'
import botbuilderReduxMiddleware, { getStore } from '../../src'
const restify = require('restify')

interface State extends StoreItem {
  responses: string[],
  requesting: string | null
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

const conversationState = new ConversationState(new MemoryStorage());
type Reducer = ReduxReducer<State>

const reducer: Reducer = (prevState: State, action: AnyAction) : State => {
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

const storeCreator: StoreCreatorFromStorage<State> = (stateFromStorage: State) => {
  const defaultState: State = {requesting: null, responses: []}
  return createStore(reducer, stateFromStorage || defaultState)
}

const storeKey = Symbol('reduxStoreKey')
adapter.use(conversationState);
adapter.use(botbuilderReduxMiddleware(conversationState, storeCreator, storeKey))

server.post('/api/messages', (req, res) => {
  adapter.processActivity(req, res, (context) => {
    // This bot is only handling Messages
    if (context.activity.type === 'message') {
      const {dispatch, getState} = getStore<State>(context, storeKey)
      dispatch({type: 'CLEAR_RESPONSES'})
      console.log(context.activity.text)
      dispatch({type: 'INCOMING_MESSAGE', data: context.activity.text})

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

      const messages: Partial<Activity>[] = responses.map(text => ({
        type: 'message',
        text
      }))

      return context.sendActivities(messages);
    } else {
        // Echo back the type of activity the bot detected if not of type message
      return context.sendActivity(`[${context.activity.type} event detected]`);
    }
  });
})