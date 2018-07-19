import { Store } from 'redux';
import { TurnContext } from 'botbuilder';
import botbuilderReduxMiddleware from './botbuilderReduxMiddleware';
export default botbuilderReduxMiddleware;
declare const getStore: <T>(context: TurnContext, namespace?: string | symbol) => Store<T>;
export { getStore };
