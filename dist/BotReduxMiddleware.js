(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
    const defaultSaveStore = (store, context) => {
        context.reduxStore = store;
    };
    const defaultGetStore = (context) => context.reduxStore;
    class BotReduxMiddleware {
        constructor(createStore, getStore = defaultGetStore, saveStore = defaultSaveStore) {
            this.createStore = createStore;
            this.getStore = getStore;
            this.saveStore = saveStore;
        }
        getInitialState(context) {
            // Ensure storage
            if (!context.storage) {
                return Promise.reject(new Error(`BotReduxMiddleware: context.storage not found.`));
            }
            const reduxKey = this.getReduxKey(context);
            return context.storage.read([reduxKey])
                .then((storState) => {
                if (Object.getOwnPropertyNames(storState).length === 0) {
                    return null;
                }
                delete storState[reduxKey].eTag; // removes eTag
                return storState[reduxKey];
            });
        }
        getReduxKey(context) {
            const convoRef = context.conversationReference;
            if (!convoRef.conversation) {
                return 'conversation/default/redux';
            }
            return 'conversation/' + convoRef.conversation.id + '/redux';
        }
        contextCreated(context) {
            return this.getInitialState(context)
                .then((stateFromStorage) => {
                this.saveStore(this.createStore(stateFromStorage), context);
            });
        }
        postActivity(context, activities) {
            // Ensure storage
            if (!context.storage) {
                return Promise.reject(new Error(`BotReduxMiddleware: context.storage not found.`));
            }
            const state = this.getStore(context).getState();
            const changes = {};
            state.eTag = '*';
            changes[this.getReduxKey(context)] = state;
            return context.storage.write(changes);
        }
    }
    exports.default = BotReduxMiddleware;
});
//# sourceMappingURL=BotReduxMiddleware.js.map