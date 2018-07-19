"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
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
function BotbuilderReduxMiddleware(conversationState, createStoreFunction, namespace = 'reduxStore', convoStateKey = '__REDUX_STATE__') {
    return {
        onTurn: (context, next) => __awaiter(this, void 0, void 0, function* () {
            const convoStateObj = conversationState.get(context) || { [convoStateKey]: {} };
            const stateFromConvoState = convoStateObj[convoStateKey];
            const store = createStoreFunction(stateFromConvoState);
            context.services.set(namespace, store);
            yield next();
            convoStateObj[convoStateKey] = store.getState();
        })
    };
}
exports.default = BotbuilderReduxMiddleware;
//# sourceMappingURL=botbuilderReduxMiddleware.js.map