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
    class IncomingMessageReduxMiddleware {
        constructor(getStore = (context) => context.reduxStore) {
            this.getStore = getStore;
        }
        contextCreated(context) {
            this.getStore(context).dispatch({ type: 'CLEAR_RESPONSES' });
            this.getStore(context).dispatch({ type: 'INCOMING_MESSAGE', data: context.request.text });
        }
    }
    exports.default = IncomingMessageReduxMiddleware;
});
//# sourceMappingURL=IncomingMessageReduxMiddleware.js.map