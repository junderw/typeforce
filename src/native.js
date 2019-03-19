"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types = {
    Array: (value) => {
        return value !== null && value !== undefined && value.constructor === Array;
    },
    Boolean: (value) => {
        return typeof value === 'boolean';
    },
    Function: (value) => {
        return typeof value === 'function';
    },
    Nil: (value) => {
        return value === undefined || value === null;
    },
    Null: (value) => {
        return value === undefined || value === null;
    },
    Number: (value) => {
        return typeof value === 'number';
    },
    Object: (value) => {
        return typeof value === 'object';
    },
    String: (value) => {
        return typeof value === 'string';
    },
    '': () => {
        return true;
    },
};
for (var typeName in types) {
    types[typeName].toJSON = ((t) => {
        return t;
    }).bind(null, typeName);
}
exports.default = types;
