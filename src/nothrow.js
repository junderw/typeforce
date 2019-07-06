"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
function tfNoThrow(type, value, strict) {
    try {
        return index_1.default(type, value, strict);
    }
    catch (e) {
        tfNoThrow.error = e;
        return false;
    }
}
exports.default = Object.assign(tfNoThrow, index_1.default);
