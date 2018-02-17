import { Store as ReduxStore, Reducer } from 'redux';
import { Activity, StoreItem, StoreItems, Middleware, ConversationResourceResponse } from 'botbuilder';

declare global {
  export interface BotContext {
    reduxStore: ReduxStore<any>
  }
}

/** 
 * Middleware for managing your redux between turns.
 * 
 * __Extends BotContext:__
 * * context.reduxStore - Redux Store
 * 
 * __Depends on:__
 * * context.storage - Storage provider for storing and retrieving objects
 * 
 * **Usage Example**
 *
 * ```js
 * const bot = new Bot(adapter)
 *      .use(new MemoryStorage())
 *      .use(new (stateFromStorage) => {
 *        const defaultState = {requesting: null, responses: []}
 *        return createStore(reducer, stateFromStorage || defaultState)
 *      })
 *      .onReceive((context) => {
 *          context.reply(`Hello World`);
 *      })
 * ```
 */
const defaultSaveStore = <T>(store: ReduxStore<T>, context: BotContext): void => {
  context.reduxStore = store
}

const defaultGetStore = (context: BotContext) => context.reduxStore

class BotReduxMiddleware<S extends StoreItem> implements Middleware {
  protected createStore: (stateFromStorage: S) => ReduxStore<S>
  protected getStore: (context: BotContext) => ReduxStore<S> 
  protected saveStore: (store: ReduxStore<S>, context: BotContext) => void
  
  constructor (
    createStore: (stateFromStorage: S) => ReduxStore<S>, 
    getStore: (context: BotContext) => ReduxStore<S> = defaultGetStore,
    saveStore: (store: ReduxStore<S>, context: BotContext) => void = defaultSaveStore
  ) {
    this.createStore = createStore
    this.getStore = getStore
    this.saveStore = saveStore
  }

  getInitialState (context: BotContext) {
    // Ensure storage
    if (!context.storage) { 
      return Promise.reject(new Error(`BotReduxMiddleware: context.storage not found.`)); 
    }

    const reduxKey = this.getReduxKey(context)
    return context.storage.read([reduxKey])
      .then((storState: StoreItem) => {
        if (Object.getOwnPropertyNames(storState).length === 0) {
          return null
        }
        delete storState[reduxKey].eTag // removes eTag
        return storState[reduxKey]
      })
  }

  getReduxKey (context: BotContext) {
    const convoRef = context.conversationReference
    if (!convoRef.conversation) {
      return 'conversation/default/redux'
    }
    return 'conversation/' + convoRef.conversation.id + '/redux'
  }

  contextCreated (context: BotContext, next: () => Promise<void>) {
    return this.getInitialState(context)
      .then((stateFromStorage: S) => {
        this.saveStore(this.createStore(stateFromStorage), context)
      }).catch((error: any) => {
        console.error(error)
      }).then(next)
  }

  postActivity (context: BotContext, activities: Activity[], 
      next: (newActivities?: Partial<Activity>[]) => Promise<ConversationResourceResponse[]>) {
    // Ensure storage
    if (!context.storage) { 
      return Promise.reject(new Error(`BotReduxMiddleware: context.storage not found.`)); 
    }
    const state = this.getStore(context).getState()
    const changes: StoreItems = {}
    state.eTag = '*'
    changes[this.getReduxKey(context)] = state
    return context.storage.write(changes)
      .then(() => next(activities))
  }
}

export default BotReduxMiddleware
