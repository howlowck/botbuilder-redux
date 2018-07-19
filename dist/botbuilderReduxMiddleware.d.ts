import { Store as ReduxStore } from 'redux';
import { StoreItem, TurnContext, ConversationState } from 'botbuilder';
/**
 * Middleware for managing your redux between turns.
 *
 * **Usage Example**
 *
 * ```typescript
 * const conversationState = new ConversationState(new MemoryStorage());
 *
 * const storeCreator: StoreCreatorFromStorage<State> = (stateFromStorage: State) => {
 *   const defaultState: State = {requesting: null, responses: []}
 *   return createStore(reducer, stateFromStorage || defaultState)
 * }
 *
 * const storeKey = Symbol('reduxStoreKey')
 * adapter.use(conversationState);
 * adapter.use(BotReduxMiddleware(conversationState, storeCreator, storeKey))
 *
 *
 * ```
 */
export default function BotbuilderReduxMiddleware(conversationState: ConversationState, createStoreFunction: (stateFromStorage: StoreItem) => ReduxStore<StoreItem>, namespace?: string | symbol, convoStateKey?: string): {
    onTurn: (context: TurnContext, next: () => any) => Promise<void>;
};
