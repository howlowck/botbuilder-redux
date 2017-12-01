import { Store } from 'redux';
import BotReduxMiddleware from './BotReduxMiddleware';
import IncomingMessageReduxMiddleware, { IncomingMessageState } from './IncomingMessageReduxMiddleware';
export declare function defaultRenderer<T extends IncomingMessageState>(ctx: BotContext, store: Store<T>): void;
export { BotReduxMiddleware };
export { IncomingMessageReduxMiddleware };
declare const getStore: <T>(context: BotContext) => Store<T>;
export { getStore };
