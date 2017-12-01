(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./BotReduxMiddleware", "./IncomingMessageReduxMiddleware"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const BotReduxMiddleware_1 = require("./BotReduxMiddleware");
    exports.BotReduxMiddleware = BotReduxMiddleware_1.default;
    const IncomingMessageReduxMiddleware_1 = require("./IncomingMessageReduxMiddleware");
    exports.IncomingMessageReduxMiddleware = IncomingMessageReduxMiddleware_1.default;
    function defaultRenderer(ctx, store) {
        store.getState().responses.forEach((response) => {
            ctx.reply(response);
        });
    }
    exports.defaultRenderer = defaultRenderer;
    const getStore = (context) => context.reduxStore;
    exports.getStore = getStore;
});
//# sourceMappingURL=index.js.map