import { Store as ReduxStore } from 'redux';
import { Activity, StoreItem, Middleware } from 'botbuilder-core';
declare global  {
    interface BotContext {
        reduxStore: ReduxStore<any>;
    }
}
declare class BotReduxMiddleware<S extends StoreItem> implements Middleware {
    protected createStore: (stateFromStorage: S) => ReduxStore<S>;
    protected getStore: (context: BotContext) => ReduxStore<S>;
    protected saveStore: (store: ReduxStore<S>, context: BotContext) => void;
    protected storeName: string;
    constructor(createStore: (stateFromStorage: S) => ReduxStore<S>, getStore?: (context: BotContext) => ReduxStore<S>, saveStore?: (store: ReduxStore<S>, context: BotContext) => void);
    getInitialState(context: BotContext): any;
    getReduxKey(context: BotContext): string;
    contextCreated(context: BotContext): any;
    postActivity(context: BotContext, activities: Partial<Activity>[]): any;
}
export default BotReduxMiddleware;
