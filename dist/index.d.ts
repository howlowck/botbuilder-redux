import { Store } from 'redux';
import BotReduxMiddleware from './BotReduxMiddleware';
export default BotReduxMiddleware;
declare const getStore: <T>(context: BotContext) => Store<T>;
export { getStore };
