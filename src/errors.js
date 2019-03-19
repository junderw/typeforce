"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const native = require('./native');
function getValueTypeName(value) {
    return native.Nil(value) ? '' : getTypeName(value.constructor);
}
exports.getValueTypeName = getValueTypeName;
function tfJSON(type) {
    if (native.Function(type))
        return type.toJSON ? type.toJSON() : getTypeName(type);
    if (native.Array(type))
        return 'Array';
    if (type && native.Object(type))
        return 'Object';
    return type !== undefined ? type : '';
}
exports.tfJSON = tfJSON;
class TfTypeError extends Error {
    constructor(__type, __value, __valueTypeName) {
        super();
        this.__type = __type;
        this.__value = __value;
        this.__valueTypeName = __valueTypeName;
        this.__valueTypeName = __valueTypeName || getValueTypeName(__value);
        this.message = tfErrorString(__type, __value, __valueTypeName);
        captureStackTrace(this, TfTypeError);
    }
}
exports.TfTypeError = TfTypeError;
class TfPropertyTypeError extends Error {
    constructor(__type, __property, __label, __value, __valueTypeName) {
        super();
        this.__type = __type;
        this.__property = __property;
        this.__label = __label;
        this.__value = __value;
        this.__valueTypeName = __valueTypeName;
        if (__type) {
            this.__valueTypeName = __valueTypeName || getValueTypeName(__value);
            this.message = tfPropertyErrorString(__type, __label, __property, __value, __valueTypeName);
        }
        else {
            this.message = 'Unexpected property "' + __property + '"';
        }
        captureStackTrace(this, TfTypeError);
    }
}
exports.TfPropertyTypeError = TfPropertyTypeError;
function tfCustomError(expected, actual) {
    return new TfTypeError(expected, {}, actual);
}
exports.tfCustomError = tfCustomError;
function tfSubError(e, property, label) {
    // sub child?
    if (e instanceof TfPropertyTypeError) {
        property = property + '.' + e.__property;
        e = new TfPropertyTypeError(e.__type, property, e.__label, e.__value, e.__valueTypeName);
        // child?
    }
    else if (e instanceof TfTypeError) {
        e = new TfPropertyTypeError(e.__type, property, label, e.__value, e.__valueTypeName);
    }
    captureStackTrace(e);
    return e;
}
exports.tfSubError = tfSubError;
function getTypeName(fn) {
    return fn.name || fn.toString().match(/function (.*?)\s*\(/)[1];
}
function getValue(value) {
    if (native.Function(value))
        return '';
    if (native.String(value))
        return JSON.stringify(value);
    if (value && native.Object(value))
        return '';
    return value;
}
function captureStackTrace(e, t) {
    if (Error.captureStackTrace) {
        Error.captureStackTrace(e, t);
    }
}
function tfErrorString(type, value, valueTypeName) {
    var valueJson = getValue(value);
    return ('Expected ' +
        tfJSON(type) +
        ', got' +
        (valueTypeName !== '' ? ' ' + valueTypeName : '') +
        (valueJson !== '' ? ' ' + valueJson : ''));
}
function tfPropertyErrorString(type, label, name, value, valueTypeName) {
    var description = '" of type ';
    if (label === 'key')
        description = '" with key type ';
    return tfErrorString('property "' + tfJSON(name) + description + tfJSON(type), value, valueTypeName);
}
