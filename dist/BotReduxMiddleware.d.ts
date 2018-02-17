import { Store as ReduxStore } from 'redux';
import { Activity, StoreItem, Middleware, ConversationResourceResponse } from 'botbuilder';
declare global  {
    interface BotContext {
        reduxStore: ReduxStore<any>;
    }
}
declare class BotReduxMiddleware<S extends StoreItem> implements Middleware {
    protected createStore: (stateFromStorage: S) => ReduxStore<S>;
    protected getStore: (context: BotContext) => ReduxStore<S>;
    protected saveStore: (store: ReduxStore<S>, context: BotContext) => void;
    constructor(createStore: (stateFromStorage: S) => ReduxStore<S>, getStore?: (context: BotContext) => ReduxStore<S>, saveStore?: (store: ReduxStore<S>, context: BotContext) => void);
    getInitialState(context: BotContext): Promise<any>;
    getReduxKey(context: BotContext): string;
    contextCreated(context: BotContext, next: () => Promise<void>): Promise<void>;
    postActivity(context: BotContext, activities: Activity[], next: (newActivities?: Partial<Activity>[]) => Promise<ConversationResourceResponse[]>): Promise<ConversationResourceResponse[]>;
}
export default BotReduxMiddleware;
