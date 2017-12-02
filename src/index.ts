import { Store } from 'redux';

import BotReduxMiddleware from './BotReduxMiddleware'
export default BotReduxMiddleware 

const getStore = <T>(context: BotContext) : Store<T> => context.reduxStore

export {getStore}
