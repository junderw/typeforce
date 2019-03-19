const native = require('./native');

export function getValueTypeName(value: any) {
  return native.Nil(value) ? '' : getTypeName(value.constructor);
}

export function tfJSON(type: any) {
  if (native.Function(type))
    return type.toJSON ? type.toJSON() : getTypeName(type);
  if (native.Array(type)) return 'Array';
  if (type && native.Object(type)) return 'Object';

  return type !== undefined ? type : '';
}

export class TfTypeError extends Error {
  message: string;
  constructor(
    public __type: any,
    public __value: any,
    public __valueTypeName?: string,
  ) {
    super();
    this.__valueTypeName = __valueTypeName || getValueTypeName(__value);
    this.message = tfErrorString(__type, __value, __valueTypeName);
    captureStackTrace(this, TfTypeError);
  }
}

export class TfPropertyTypeError extends Error {
  message: string;
  constructor(
    public __type: any,
    public __property: any,
    public __label: any,
    public __value: any,
    public __valueTypeName?: string,
  ) {
    super();
    if (__type) {
      this.__valueTypeName = __valueTypeName || getValueTypeName(__value);
      this.message = tfPropertyErrorString(
        __type,
        __label,
        __property,
        __value,
        __valueTypeName,
      );
    } else {
      this.message = 'Unexpected property "' + __property + '"';
    }

    captureStackTrace(this, TfTypeError);
  }
}

export function tfCustomError(expected: any, actual: any) {
  return new TfTypeError(expected, {}, actual);
}

export function tfSubError(e: Error, property: any, label: any) {
  // sub child?
  if (e instanceof TfPropertyTypeError) {
    property = property + '.' + e.__property;

    e = new TfPropertyTypeError(
      e.__type,
      property,
      e.__label,
      e.__value,
      e.__valueTypeName,
    );

    // child?
  } else if (e instanceof TfTypeError) {
    e = new TfPropertyTypeError(
      e.__type,
      property,
      label,
      e.__value,
      e.__valueTypeName,
    );
  }

  captureStackTrace(e);
  return e;
}

function getTypeName(fn: () => any) {
  return fn.name || fn.toString().match(/function (.*?)\s*\(/)![1];
}

function getValue(value: any) {
  if (native.Function(value)) return '';
  if (native.String(value)) return JSON.stringify(value);
  if (value && native.Object(value)) return '';
  return value;
}

function captureStackTrace(e: Error, t?: any) {
  if (Error.captureStackTrace) {
    Error.captureStackTrace(e, t);
  }
}

function tfErrorString(type: any, value: any, valueTypeName: any): string {
  var valueJson = getValue(value);

  return (
    'Expected ' +
    tfJSON(type) +
    ', got' +
    (valueTypeName !== '' ? ' ' + valueTypeName : '') +
    (valueJson !== '' ? ' ' + valueJson : '')
  );
}

function tfPropertyErrorString(
  type: any,
  label: any,
  name: any,
  value: any,
  valueTypeName: any,
): string {
  var description = '" of type ';
  if (label === 'key') description = '" with key type ';

  return tfErrorString(
    'property "' + tfJSON(name) + description + tfJSON(type),
    value,
    valueTypeName,
  );
}
