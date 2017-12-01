import { Store as ReduxStore } from 'redux';
export interface IncomingMessageState {
    responses: string[];
}
declare class IncomingMessageReduxMiddleware {
    protected getStore: (context: BotContext) => ReduxStore<IncomingMessageState>;
    constructor(getStore?: (context: BotContext) => ReduxStore<any>);
    contextCreated(context: BotContext): void;
}
export default IncomingMessageReduxMiddleware;
