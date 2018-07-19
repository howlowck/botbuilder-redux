import { Store } from 'redux';
import { TurnContext } from 'botbuilder';
import botbuilderReduxMiddleware from './botbuilderReduxMiddleware'

export default botbuilderReduxMiddleware 

const getStore = <T>(context: TurnContext, namespace: string | symbol = 'reduxStore') 
  : Store<T> => context.services.get(namespace)

export {getStore}
