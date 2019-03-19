"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("./errors");
const native_1 = require("./native");
var TYPES = {
    arrayOf: function arrayOf(type, options) {
        type = compile(type);
        options = options || {};
        function _arrayOf(array, strict) {
            if (!native_1.default.Array(array))
                return false;
            if (native_1.default.Nil(array))
                return false;
            if (options.minLength !== undefined && array.length < options.minLength)
                return false;
            if (options.maxLength !== undefined && array.length > options.maxLength)
                return false;
            if (options.length !== undefined && array.length !== options.length)
                return false;
            return array.every(function (value, i) {
                try {
                    return typeforce(type, value, strict);
                }
                catch (e) {
                    throw errors_1.tfSubError(e, i);
                }
            });
        }
        _arrayOf.toJSON = function () {
            var str = '[' + errors_1.tfJSON(type) + ']';
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
            return native_1.default.Nil(value) || type(value, strict, maybe);
        }
        _maybe.toJSON = function () {
            return '?' + errors_1.tfJSON(type);
        };
        return _maybe;
    },
    map: function map(propertyType, propertyKeyType) {
        propertyType = compile(propertyType);
        if (propertyKeyType)
            propertyKeyType = compile(propertyKeyType);
        function _map(value, strict) {
            if (!native_1.default.Object(value))
                return false;
            if (native_1.default.Nil(value))
                return false;
            for (var propertyName in value) {
                try {
                    if (propertyKeyType) {
                        typeforce(propertyKeyType, propertyName, strict);
                    }
                }
                catch (e) {
                    throw errors_1.tfSubError(e, propertyName, 'key');
                }
                try {
                    var propertyValue = value[propertyName];
                    typeforce(propertyType, propertyValue, strict);
                }
                catch (e) {
                    throw errors_1.tfSubError(e, propertyName);
                }
            }
            return true;
        }
        if (propertyKeyType) {
            _map.toJSON = function () {
                return ('{' + errors_1.tfJSON(propertyKeyType) + ': ' + errors_1.tfJSON(propertyType) + '}');
            };
        }
        else {
            _map.toJSON = function () {
                return '{' + errors_1.tfJSON(propertyType) + '}';
            };
        }
        return _map;
    },
    object: function object(uncompiled) {
        var type = {};
        for (var typePropertyName in uncompiled) {
            type[typePropertyName] = compile(uncompiled[typePropertyName]);
        }
        function _object(value, strict) {
            if (!native_1.default.Object(value))
                return false;
            if (native_1.default.Nil(value))
                return false;
            var propertyName;
            try {
                for (propertyName in type) {
                    var propertyType = type[propertyName];
                    var propertyValue = value[propertyName];
                    typeforce(propertyType, propertyValue, strict);
                }
            }
            catch (e) {
                throw errors_1.tfSubError(e, propertyName);
            }
            if (strict) {
                for (propertyName in value) {
                    if (type[propertyName])
                        continue;
                    throw new errors_1.TfPropertyTypeError(undefined, propertyName);
                }
            }
            return true;
        }
        _object.toJSON = function () {
            return errors_1.tfJSON(type);
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
            return types.map(errors_1.tfJSON).join('|');
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
            return types.map(errors_1.tfJSON).join(' & ');
        };
        return _allOf;
    },
    quacksLike: function quacksLike(type) {
        function _quacksLike(value) {
            return type === errors_1.getValueTypeName(value);
        }
        _quacksLike.toJSON = function () {
            return type;
        };
        return _quacksLike;
    },
    tuple: function tuple() {
        var types = [].slice.call(arguments).map(compile);
        function _tuple(values, strict) {
            if (native_1.default.Nil(values))
                return false;
            if (native_1.default.Nil(values.length))
                return false;
            if (strict && values.length !== types.length)
                return false;
            return types.every(function (type, i) {
                try {
                    return typeforce(type, values[i], strict);
                }
                catch (e) {
                    throw errors_1.tfSubError(e, i);
                }
            });
        }
        _tuple.toJSON = function () {
            return '(' + types.map(errors_1.tfJSON).join(', ') + ')';
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
    if (native_1.default.String(type)) {
        if (type[0] === '?')
            return TYPES.maybe(type.slice(1));
        return native_1.default[type] || TYPES.quacksLike(type);
    }
    else if (type && native_1.default.Object(type)) {
        if (native_1.default.Array(type)) {
            if (type.length !== 1)
                throw new TypeError('Expected compile() parameter of type Array of length 1');
            return TYPES.arrayOf(type[0]);
        }
        return TYPES.object(type);
    }
    else if (native_1.default.Function(type)) {
        return type;
    }
    return TYPES.value(type);
}
function typeforce(type, value, strict, surrogate) {
    if (native_1.default.Function(type)) {
        if (type(value, strict))
            return true;
        throw new errors_1.TfTypeError(surrogate || type, value);
    }
    // JIT
    return typeforce(compile(type), value, strict);
}
// assign types to typeforce function
for (var typeName in native_1.default) {
    typeforce[typeName] = native_1.default[typeName];
}
for (typeName in TYPES) {
    typeforce[typeName] = TYPES[typeName];
}
var EXTRA = require('./extra');
for (typeName in EXTRA) {
    typeforce[typeName] = EXTRA[typeName];
}
typeforce.compile = compile;
typeforce.TfTypeError = errors_1.TfTypeError;
typeforce.TfPropertyTypeError = errors_1.TfPropertyTypeError;
module.exports = typeforce;
