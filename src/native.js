"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.native = {
    Array: function (value) {
        return value !== null && value !== undefined && value.constructor === Array;
    },
    Boolean: function (value) {
        return typeof value === 'boolean';
    },
    Function: function (value) {
        return typeof value === 'function';
    },
    Nil: function (value) {
        return value === undefined || value === null;
    },
    Null: function (value) {
        return value === undefined || value === null;
    },
    Number: function (value) {
        return typeof value === 'number';
    },
    Object: function (value) {
        return typeof value === 'object';
    },
    String: function (value) {
        return typeof value === 'string';
    },
    '': function () {
        return true;
    },
};
for (var typeName in exports.native) {
    if (!typeName)
        continue;
    // @ts-ignore
    exports.native[typeName].toJSON = (function (t) {
        return t;
    }).bind(null, typeName);
}
