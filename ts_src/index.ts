import * as ERRORS from './errors';
import { extra as EXTRA } from './extra';
import { native as NATIVE } from './native';

// short-hand
const tfJSON = ERRORS.tfJSON;
const TfTypeError = ERRORS.TfTypeError;
const TfPropertyTypeError = ERRORS.TfPropertyTypeError;
const tfSubError = ERRORS.tfSubError;
const getValueTypeName = ERRORS.getValueTypeName;

const TYPES = {
  arrayOf: function arrayOf(
    type: any,
    options?: {
      minLength?: number;
      maxLength?: number;
      length?: number;
    },
  ): (array: any, strict?: boolean) => boolean {
    type = compile(type);
    options = options || {};

    function _arrayOf(array: any, strict?: boolean): boolean {
      if (!NATIVE.Array(array)) return false;
      if (NATIVE.Nil(array)) return false;
      if (
        options!.minLength !== undefined &&
        array.length < options!.minLength!
      )
        return false;
      if (
        options!.maxLength !== undefined &&
        array.length > options!.maxLength!
      )
        return false;
      if (options!.length !== undefined && array.length !== options!.length)
        return false;

      return array.every((value: any, i: number) => {
        try {
          return typeforce(type, value, strict);
        } catch (e) {
          throw tfSubError(e, i.toString());
        }
      });
    }
    _arrayOf.toJSON = (): string => {
      let str = '[' + tfJSON(type) + ']';
      if (options!.length !== undefined) {
        str += '{' + options!.length + '}';
      } else if (
        options!.minLength !== undefined ||
        options!.maxLength !== undefined
      ) {
        str +=
          '{' +
          (options!.minLength === undefined ? 0 : options!.minLength) +
          ',' +
          (options!.maxLength === undefined ? Infinity : options!.maxLength) +
          '}';
      }
      return str;
    };

    return _arrayOf;
  },

  maybe: function maybe(type: any): (value: any, strict?: boolean) => boolean {
    type = compile(type);

    function _maybe(value: any, strict?: boolean): boolean {
      return NATIVE.Nil(value) || type(value, strict, maybe);
    }
    _maybe.toJSON = (): string => {
      return '?' + tfJSON(type);
    };

    return _maybe;
  },

  map: function map(
    propertyType: any,
    propertyKeyType: any,
  ): (value: any, strict?: boolean) => boolean {
    propertyType = compile(propertyType);
    if (propertyKeyType) propertyKeyType = compile(propertyKeyType);

    function _map(value: any, strict?: boolean): boolean {
      if (!NATIVE.Object(value)) return false;
      if (NATIVE.Nil(value)) return false;

      for (const propertyName in value) {
        if (!propertyName) continue;
        try {
          if (propertyKeyType) {
            typeforce(propertyKeyType, propertyName, strict);
          }
        } catch (e) {
          throw tfSubError(e, propertyName, 'key');
        }

        try {
          const propertyValue = value[propertyName];
          typeforce(propertyType, propertyValue, strict);
        } catch (e) {
          throw tfSubError(e, propertyName);
        }
      }

      return true;
    }

    if (propertyKeyType) {
      _map.toJSON = (): string => {
        return (
          '{' + tfJSON(propertyKeyType) + ': ' + tfJSON(propertyType) + '}'
        );
      };
    } else {
      _map.toJSON = (): string => {
        return '{' + tfJSON(propertyType) + '}';
      };
    }

    return _map;
  },

  object: function object(
    uncompiled: any,
  ): (value: any, strict?: boolean) => boolean {
    const type = {};

    for (const typePropertyName in uncompiled) {
      if (!typePropertyName) continue;
      (type as any)[typePropertyName] = compile(uncompiled[typePropertyName]);
    }

    function _object(value: any, strict?: boolean): boolean {
      if (!NATIVE.Object(value)) return false;
      if (NATIVE.Nil(value)) return false;

      let propertyName;

      try {
        for (propertyName in type) {
          if (!propertyName) continue;
          const propertyType = (type as any)[propertyName];
          const propertyValue = value[propertyName];

          typeforce(propertyType, propertyValue, strict);
        }
      } catch (e) {
        throw tfSubError(e, propertyName as any);
      }

      if (strict) {
        for (propertyName in value) {
          if ((type as any)[propertyName]) continue;

          throw new (TfPropertyTypeError as any)(undefined, propertyName);
        }
      }

      return true;
    }
    _object.toJSON = (): string => {
      return tfJSON(type);
    };

    return _object;
  },

  anyOf: function anyOf(): (value: any, strict?: boolean) => boolean {
    const types = [].slice.call(arguments).map(compile);

    function _anyOf(value: any, strict?: boolean): boolean {
      return types.some(type => {
        try {
          return typeforce(type, value, strict);
        } catch (e) {
          return false;
        }
      });
    }
    _anyOf.toJSON = (): string => {
      return types.map(tfJSON).join('|');
    };

    return _anyOf;
  },

  allOf: function allOf(): (value: any, strict?: boolean) => boolean {
    const types = [].slice.call(arguments).map(compile);

    function _allOf(value: any, strict?: boolean): boolean {
      return types.every(type => {
        try {
          return typeforce(type, value, strict);
        } catch (e) {
          return false;
        }
      });
    }
    _allOf.toJSON = (): string => {
      return types.map(tfJSON).join(' & ');
    };

    return _allOf;
  },

  quacksLike: function quacksLike(type: any): (value: any) => boolean {
    function _quacksLike(value: any): boolean {
      return type === getValueTypeName(value);
    }
    _quacksLike.toJSON = (): string => {
      return type;
    };

    return _quacksLike;
  },

  tuple: function tuple(): (values: any, strict?: boolean) => boolean {
    const types = [].slice.call(arguments).map(compile);

    function _tuple(values: any, strict?: boolean): boolean {
      if (NATIVE.Nil(values)) return false;
      if (NATIVE.Nil(values.length)) return false;
      if (strict && values.length !== types.length) return false;

      return types.every((type, i) => {
        try {
          return typeforce(type, values[i], strict);
        } catch (e) {
          throw tfSubError(e, i.toString());
        }
      });
    }
    _tuple.toJSON = (): string => {
      return '(' + types.map(tfJSON).join(', ') + ')';
    };

    return _tuple;
  },

  value: function value(expected: any): (actual: any) => boolean {
    function _value(actual: any): boolean {
      return actual === expected;
    }
    _value.toJSON = (): string => {
      return expected;
    };

    return _value;
  },
};

// TODO: deprecate
(TYPES as any).oneOf = TYPES.anyOf;

function compile(type: any): any {
  if (NATIVE.String(type)) {
    if (type[0] === '?') return TYPES.maybe(type.slice(1));

    return NATIVE[type] || TYPES.quacksLike(type);
  } else if (type && NATIVE.Object(type)) {
    if (NATIVE.Array(type)) {
      if (type.length !== 1)
        throw new TypeError(
          'Expected compile() parameter of type Array of length 1',
        );
      return TYPES.arrayOf(type[0]);
    }

    return TYPES.object(type);
  } else if (NATIVE.Function(type)) {
    return type;
  }

  return TYPES.value(type);
}

function typeforce(
  type: any,
  value: any,
  strict?: boolean,
  surrogate?: any,
): boolean {
  if (NATIVE.Function(type)) {
    if (type(value, strict)) return true;

    throw new (TfTypeError as any)(surrogate || type, value);
  }

  // JIT
  return typeforce(compile(type), value, strict);
}

// assign types to typeforce function
for (const typeName in NATIVE) {
  if (!typeName) continue;
  (typeforce as any)[typeName] = NATIVE[typeName];
}

for (const typeName in TYPES) {
  if (!typeName) continue;
  (typeforce as any)[typeName] = (TYPES as any)[typeName];
}

for (const typeName in EXTRA) {
  if (!typeName) continue;
  (typeforce as any)[typeName] = (EXTRA as any)[typeName];
}

typeforce.compile = compile;
typeforce.TfTypeError = TfTypeError;
typeforce.TfPropertyTypeError = TfPropertyTypeError;

export default typeforce;
