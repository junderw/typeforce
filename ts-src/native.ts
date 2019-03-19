type Checker = (v: any) => boolean;

const types: { [index: string]: Checker } = {
  Array: (value: any) => {
    return value !== null && value !== undefined && value.constructor === Array;
  },
  Boolean: (value: any) => {
    return typeof value === 'boolean';
  },
  Function: (value: any) => {
    return typeof value === 'function';
  },
  Nil: (value: any) => {
    return value === undefined || value === null;
  },
  Null: (value: any) => {
    return value === undefined || value === null;
  },
  Number: (value: any) => {
    return typeof value === 'number';
  },
  Object: (value: any) => {
    return typeof value === 'object';
  },
  String: (value: any) => {
    return typeof value === 'string';
  },
  '': () => {
    return true;
  },
};

for (var typeName in types) {
  types[typeName].toJSON = ((t: any) => {
    return t;
  }).bind(null, typeName);
}

export default types;
