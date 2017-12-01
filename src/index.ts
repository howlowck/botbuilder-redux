import { Store } from 'redux';

import BotReduxMiddleware from './BotReduxMiddleware'
import IncomingMessageReduxMiddleware, {IncomingMessageState} from './IncomingMessageReduxMiddleware'

export function defaultRenderer<T extends IncomingMessageState> (
  ctx: BotContext, 
  store: Store<T>
) {
  store.getState().responses.forEach((response) => {
    ctx.reply(response)
  })
}

export { BotReduxMiddleware }
export { IncomingMessageReduxMiddleware }

const getStore = <T>(context: BotContext) : Store<T> => context.reduxStore

export {getStore}
