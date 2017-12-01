import { Store as ReduxStore } from 'redux';

export interface IncomingMessageState {
  responses: string[]
}

class IncomingMessageReduxMiddleware {
  protected getStore : (context: BotContext) => ReduxStore<IncomingMessageState>
  constructor (getStore: (context: BotContext) => ReduxStore<any> = (context) => context.reduxStore) {
    this.getStore = getStore
  }
  contextCreated (context: BotContext) {
    this.getStore(context).dispatch({type: 'CLEAR_RESPONSES'})
    this.getStore(context).dispatch({type: 'INCOMING_MESSAGE', data: context.request.text})
  }
}

export default IncomingMessageReduxMiddleware
