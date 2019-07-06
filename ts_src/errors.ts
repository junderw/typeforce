import { native } from './native';

function getTypeName(fn: any): string {
  return fn.name || fn.toString().match(/function (.*?)\s*\(/)[1];
}

export function getValueTypeName(value: any): any {
  return native.Nil(value) ? '' : getTypeName(value.constructor);
}

function getValue(value: any): any {
  if (native.Function(value)) return '';
  if (native.String(value)) return JSON.stringify(value);
  if (value && native.Object(value)) return '';
  return value;
}

function captureStackTrace(e: any, t?: any): void {
  if (Error.captureStackTrace) {
    Error.captureStackTrace(e, t);
  }
}

export function tfJSON(type: any): any {
  if (native.Function(type))
    return type.toJSON ? type.toJSON() : getTypeName(type);
  if (native.Array(type)) return 'Array';
  if (type && native.Object(type)) return 'Object';

  return type !== undefined ? type : '';
}

function tfErrorString(type: any, value: any, valueTypeName: string): string {
  const valueJson = getValue(value);

  return (
    'Expected ' +
    tfJSON(type) +
    ', got' +
    (valueTypeName !== '' ? ' ' + valueTypeName : '') +
    (valueJson !== '' ? ' ' + valueJson : '')
  );
}

export function TfTypeError(
  this: any,
  type: any,
  value: any,
  valueTypeName?: string,
): any {
  valueTypeName = valueTypeName || getValueTypeName(value);
  this.message = tfErrorString(type, value, valueTypeName!);

  captureStackTrace(this, TfTypeError);
  this.__type = type;
  this.__value = value;
  this.__valueTypeName = valueTypeName;
}

TfTypeError.prototype = Object.create(Error.prototype);
TfTypeError.prototype.constructor = TfTypeError;

function tfPropertyErrorString(
  type: any,
  label: string,
  name: string,
  value: any,
  valueTypeName: string,
): string {
  let description = '" of type ';
  if (label === 'key') description = '" with key type ';

  return tfErrorString(
    'property "' + tfJSON(name) + description + tfJSON(type),
    value,
    valueTypeName,
  );
}

export function TfPropertyTypeError(
  this: any,
  type: any,
  property: string,
  label?: string,
  value?: any,
  valueTypeName?: string,
): void {
  if (type) {
    valueTypeName = valueTypeName || getValueTypeName(value);
    this.message = tfPropertyErrorString(
      type,
      label!,
      property,
      value,
      valueTypeName!,
    );
  } else {
    this.message = 'Unexpected property "' + property + '"';
  }

  captureStackTrace(this, TfTypeError);
  this.__label = label;
  this.__property = property;
  this.__type = type;
  this.__value = value;
  this.__valueTypeName = valueTypeName;
}

TfPropertyTypeError.prototype = Object.create(Error.prototype);
TfPropertyTypeError.prototype.constructor = TfTypeError;

export function tfCustomError(expected: any, actual: any): any {
  // @ts-ignore
  return new TfTypeError(expected, {}, actual);
}

export function tfSubError(e: any, property: string, label?: string): any {
  // sub child?
  if (e instanceof TfPropertyTypeError) {
    property = property + '.' + (e as any).__property;

    // @ts-ignore
    e = new TfPropertyTypeError(
      (e as any).__type,
      property,
      (e as any).__label,
      (e as any).__value,
      (e as any).__valueTypeName,
    );

    // child?
  } else if (e instanceof TfTypeError) {
    // @ts-ignore
    e = new TfPropertyTypeError(
      (e as any).__type,
      property,
      label!,
      (e as any).__value,
      (e as any).__valueTypeName,
    );
  }

  captureStackTrace(e);
  return e;
}
