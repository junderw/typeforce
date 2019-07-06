import * as ERRORS from './errors';
import { native as NATIVE } from './native';

function _Buffer(value: any): boolean {
  return Buffer.isBuffer(value);
}

function Hex(value: any): boolean {
  return typeof value === 'string' && /^([0-9a-f]{2})+$/i.test(value);
}

function _LengthN(type: any, length: number): (value: any) => boolean {
  const name = type.toJSON();

  function Length(value: any): boolean {
    if (!type(value)) return false;
    if (value.length === length) return true;

    throw ERRORS.tfCustomError(
      name + '(Length: ' + length + ')',
      name + '(Length: ' + value.length + ')',
    );
  }
  Length.toJSON = (): string => {
    return name;
  };

  return Length;
}

const _ArrayN = _LengthN.bind(null, NATIVE.Array);
const _BufferN = _LengthN.bind(null, _Buffer);
const _HexN = _LengthN.bind(null, Hex);
const _StringN = _LengthN.bind(null, NATIVE.String);

function Range(
  a: number,
  b: number,
  f: (v: any) => boolean,
): (value: any, strict: boolean) => boolean {
  f = f || NATIVE.Number;
  function _range(value: any, strict: boolean): boolean {
    return (f as any)(value, strict) && value > a && value < b;
  }
  _range.toJSON = (): string => {
    return `${(f as any).toJSON()} between [${a}, ${b}]`;
  };
  return _range;
}

const INT53_MAX = Math.pow(2, 53) - 1;

function Finite(value: any): boolean {
  return typeof value === 'number' && isFinite(value);
}
function Int8(value: any): boolean {
  return (value << 24) >> 24 === value;
}
function Int16(value: any): boolean {
  return (value << 16) >> 16 === value;
}
function Int32(value: any): boolean {
  return (value | 0) === value;
}
function Int53(value: any): boolean {
  return (
    typeof value === 'number' &&
    value >= -INT53_MAX &&
    value <= INT53_MAX &&
    Math.floor(value) === value
  );
}
function UInt8(value: any): boolean {
  return (value & 0xff) === value;
}
function UInt16(value: any): boolean {
  return (value & 0xffff) === value;
}
function UInt32(value: any): boolean {
  return value >>> 0 === value;
}
function UInt53(value: any): boolean {
  return (
    typeof value === 'number' &&
    value >= 0 &&
    value <= INT53_MAX &&
    Math.floor(value) === value
  );
}

const types = {
  ArrayN: _ArrayN,
  Buffer: _Buffer,
  BufferN: _BufferN,
  Finite,
  Hex,
  HexN: _HexN,
  Int8,
  Int16,
  Int32,
  Int53,
  Range,
  StringN: _StringN,
  UInt8,
  UInt16,
  UInt32,
  UInt53,
};

for (const typeName in types) {
  if (!typeName) continue;
  // @ts-ignore
  types[typeName].toJSON = ((t: any): any => {
    return t;
  }).bind(null, typeName);
}

export { types as extra };
