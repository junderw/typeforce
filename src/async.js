"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
// async wrapper
function tfAsync(type, value, strict, callback) {
    // default to falsy strict if using shorthand overload
    if (typeof strict === 'function')
        return tfAsync(type, value, false, strict);
    try {
        index_1.default(type, value, strict);
    }
    catch (e) {
        return callback(e);
    }
    callback();
}
exports.default = Object.assign(tfAsync, index_1.default);
