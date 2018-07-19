"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilderReduxMiddleware_1 = require("./botbuilderReduxMiddleware");
exports.default = botbuilderReduxMiddleware_1.default;
const getStore = (context, namespace = 'reduxStore') => context.services.get(namespace);
exports.getStore = getStore;
//# sourceMappingURL=index.js.map