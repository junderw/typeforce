"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ERRORS = require("./errors");
var extra_1 = require("./extra");
var native_1 = require("./native");
// short-hand
var tfJSON = ERRORS.tfJSON;
var TfTypeError = ERRORS.TfTypeError;
var TfPropertyTypeError = ERRORS.TfPropertyTypeError;
var tfSubError = ERRORS.tfSubError;
var getValueTypeName = ERRORS.getValueTypeName;
var TYPES = {
    arrayOf: function arrayOf(type, options) {
        type = compile(type);
        options = options || {};
        function _arrayOf(array, strict) {
            if (!native_1.native.Array(array))
                return false;
            if (native_1.native.Nil(array))
                return false;
            if (options.minLength !== undefined &&
                array.length < options.minLength)
                return false;
            if (options.maxLength !== undefined &&
                array.length > options.maxLength)
                return false;
            if (options.length !== undefined && array.length !== options.length)
                return false;
            return array.every(function (value, i) {
                try {
                    return typeforce(type, value, strict);
                }
                catch (e) {
                    throw tfSubError(e, i.toString());
                }
            });
        }
        _arrayOf.toJSON = function () {
            var str = '[' + tfJSON(type) + ']';
            if (options.length !== undefined) {
                str += '{' + options.length + '}';
            }
            else if (options.minLength !== undefined ||
                options.maxLength !== undefined) {
                str +=
                    '{' +
                        (options.minLength === undefined ? 0 : options.minLength) +
                        ',' +
                        (options.maxLength === undefined ? Infinity : options.maxLength) +
                        '}';
            }
            return str;
        };
        return _arrayOf;
    },
    maybe: function maybe(type) {
        type = compile(type);
        function _maybe(value, strict) {
            return native_1.native.Nil(value) || type(value, strict, maybe);
        }
        _maybe.toJSON = function () {
            return '?' + tfJSON(type);
        };
        return _maybe;
    },
    map: function map(propertyType, propertyKeyType) {
        propertyType = compile(propertyType);
        if (propertyKeyType)
            propertyKeyType = compile(propertyKeyType);
        function _map(value, strict) {
            if (!native_1.native.Object(value))
                return false;
            if (native_1.native.Nil(value))
                return false;
            for (var propertyName in value) {
                if (!propertyName)
                    continue;
                try {
                    if (propertyKeyType) {
                        typeforce(propertyKeyType, propertyName, strict);
                    }
                }
                catch (e) {
                    throw tfSubError(e, propertyName, 'key');
                }
                try {
                    var propertyValue = value[propertyName];
                    typeforce(propertyType, propertyValue, strict);
                }
                catch (e) {
                    throw tfSubError(e, propertyName);
                }
            }
            return true;
        }
        if (propertyKeyType) {
            _map.toJSON = function () {
                return ('{' + tfJSON(propertyKeyType) + ': ' + tfJSON(propertyType) + '}');
            };
        }
        else {
            _map.toJSON = function () {
                return '{' + tfJSON(propertyType) + '}';
            };
        }
        return _map;
    },
    object: function object(uncompiled) {
        var type = {};
        for (var typePropertyName in uncompiled) {
            if (!typePropertyName)
                continue;
            type[typePropertyName] = compile(uncompiled[typePropertyName]);
        }
        function _object(value, strict) {
            if (!native_1.native.Object(value))
                return false;
            if (native_1.native.Nil(value))
                return false;
            var propertyName;
            try {
                for (propertyName in type) {
                    if (!propertyName)
                        continue;
                    var propertyType = type[propertyName];
                    var propertyValue = value[propertyName];
                    typeforce(propertyType, propertyValue, strict);
                }
            }
            catch (e) {
                throw tfSubError(e, propertyName);
            }
            if (strict) {
                for (propertyName in value) {
                    if (type[propertyName])
                        continue;
                    throw new TfPropertyTypeError(undefined, propertyName);
                }
            }
            return true;
        }
        _object.toJSON = function () {
            return tfJSON(type);
        };
        return _object;
    },
    anyOf: function anyOf() {
        var types = [].slice.call(arguments).map(compile);
        function _anyOf(value, strict) {
            return types.some(function (type) {
                try {
                    return typeforce(type, value, strict);
                }
                catch (e) {
                    return false;
                }
            });
        }
        _anyOf.toJSON = function () {
            return types.map(tfJSON).join('|');
        };
        return _anyOf;
    },
    allOf: function allOf() {
        var types = [].slice.call(arguments).map(compile);
        function _allOf(value, strict) {
            return types.every(function (type) {
                try {
                    return typeforce(type, value, strict);
                }
                catch (e) {
                    return false;
                }
            });
        }
        _allOf.toJSON = function () {
            return types.map(tfJSON).join(' & ');
        };
        return _allOf;
    },
    quacksLike: function quacksLike(type) {
        function _quacksLike(value) {
            return type === getValueTypeName(value);
        }
        _quacksLike.toJSON = function () {
            return type;
        };
        return _quacksLike;
    },
    tuple: function tuple() {
        var types = [].slice.call(arguments).map(compile);
        function _tuple(values, strict) {
            if (native_1.native.Nil(values))
                return false;
            if (native_1.native.Nil(values.length))
                return false;
            if (strict && values.length !== types.length)
                return false;
            return types.every(function (type, i) {
                try {
                    return typeforce(type, values[i], strict);
                }
                catch (e) {
                    throw tfSubError(e, i.toString());
                }
            });
        }
        _tuple.toJSON = function () {
            return '(' + types.map(tfJSON).join(', ') + ')';
        };
        return _tuple;
    },
    value: function value(expected) {
        function _value(actual) {
            return actual === expected;
        }
        _value.toJSON = function () {
            return expected;
        };
        return _value;
    },
};
// TODO: deprecate
TYPES.oneOf = TYPES.anyOf;
function compile(type) {
    if (native_1.native.String(type)) {
        if (type[0] === '?')
            return TYPES.maybe(type.slice(1));
        return native_1.native[type] || TYPES.quacksLike(type);
    }
    else if (type && native_1.native.Object(type)) {
        if (native_1.native.Array(type)) {
            if (type.length !== 1)
                throw new TypeError('Expected compile() parameter of type Array of length 1');
            return TYPES.arrayOf(type[0]);
        }
        return TYPES.object(type);
    }
    else if (native_1.native.Function(type)) {
        return type;
    }
    return TYPES.value(type);
}
function typeforce(type, value, strict, surrogate) {
    if (native_1.native.Function(type)) {
        if (type(value, strict))
            return true;
        throw new TfTypeError(surrogate || type, value);
    }
    // JIT
    return typeforce(compile(type), value, strict);
}
// assign types to typeforce function
for (var typeName in native_1.native) {
    if (!typeName)
        continue;
    typeforce[typeName] = native_1.native[typeName];
}
for (var typeName in TYPES) {
    if (!typeName)
        continue;
    typeforce[typeName] = TYPES[typeName];
}
for (var typeName in extra_1.extra) {
    if (!typeName)
        continue;
    typeforce[typeName] = extra_1.extra[typeName];
}
typeforce.compile = compile;
typeforce.TfTypeError = TfTypeError;
typeforce.TfPropertyTypeError = TfPropertyTypeError;
exports.default = typeforce;
