"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("./native");
function getTypeName(fn) {
    return fn.name || fn.toString().match(/function (.*?)\s*\(/)[1];
}
function getValueTypeName(value) {
    return native_1.native.Nil(value) ? '' : getTypeName(value.constructor);
}
exports.getValueTypeName = getValueTypeName;
function getValue(value) {
    if (native_1.native.Function(value))
        return '';
    if (native_1.native.String(value))
        return JSON.stringify(value);
    if (value && native_1.native.Object(value))
        return '';
    return value;
}
function captureStackTrace(e, t) {
    if (Error.captureStackTrace) {
        Error.captureStackTrace(e, t);
    }
}
function tfJSON(type) {
    if (native_1.native.Function(type))
        return type.toJSON ? type.toJSON() : getTypeName(type);
    if (native_1.native.Array(type))
        return 'Array';
    if (type && native_1.native.Object(type))
        return 'Object';
    return type !== undefined ? type : '';
}
exports.tfJSON = tfJSON;
function tfErrorString(type, value, valueTypeName) {
    var valueJson = getValue(value);
    return ('Expected ' +
        tfJSON(type) +
        ', got' +
        (valueTypeName !== '' ? ' ' + valueTypeName : '') +
        (valueJson !== '' ? ' ' + valueJson : ''));
}
function TfTypeError(type, value, valueTypeName) {
    valueTypeName = valueTypeName || getValueTypeName(value);
    this.message = tfErrorString(type, value, valueTypeName);
    captureStackTrace(this, TfTypeError);
    this.__type = type;
    this.__value = value;
    this.__valueTypeName = valueTypeName;
}
exports.TfTypeError = TfTypeError;
TfTypeError.prototype = Object.create(Error.prototype);
TfTypeError.prototype.constructor = TfTypeError;
function tfPropertyErrorString(type, label, name, value, valueTypeName) {
    var description = '" of type ';
    if (label === 'key')
        description = '" with key type ';
    return tfErrorString('property "' + tfJSON(name) + description + tfJSON(type), value, valueTypeName);
}
function TfPropertyTypeError(type, property, label, value, valueTypeName) {
    if (type) {
        valueTypeName = valueTypeName || getValueTypeName(value);
        this.message = tfPropertyErrorString(type, label, property, value, valueTypeName);
    }
    else {
        this.message = 'Unexpected property "' + property + '"';
    }
    captureStackTrace(this, TfTypeError);
    this.__label = label;
    this.__property = property;
    this.__type = type;
    this.__value = value;
    this.__valueTypeName = valueTypeName;
}
exports.TfPropertyTypeError = TfPropertyTypeError;
TfPropertyTypeError.prototype = Object.create(Error.prototype);
TfPropertyTypeError.prototype.constructor = TfTypeError;
function tfCustomError(expected, actual) {
    // @ts-ignore
    return new TfTypeError(expected, {}, actual);
}
exports.tfCustomError = tfCustomError;
function tfSubError(e, property, label) {
    // sub child?
    if (e instanceof TfPropertyTypeError) {
        property = property + '.' + e.__property;
        // @ts-ignore
        e = new TfPropertyTypeError(e.__type, property, e.__label, e.__value, e.__valueTypeName);
        // child?
    }
    else if (e instanceof TfTypeError) {
        // @ts-ignore
        e = new TfPropertyTypeError(e.__type, property, label, e.__value, e.__valueTypeName);
    }
    captureStackTrace(e);
    return e;
}
exports.tfSubError = tfSubError;
