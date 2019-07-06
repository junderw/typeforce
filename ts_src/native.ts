export const native: { [index: string]: (v: any) => boolean } = {
  Array: (value: any): boolean => {
    return value !== null && value !== undefined && value.constructor === Array;
  },
  Boolean: (value: any): boolean => {
    return typeof value === 'boolean';
  },
  Function: (value: any): boolean => {
    return typeof value === 'function';
  },
  Nil: (value: any): boolean => {
    return value === undefined || value === null;
  },
  Null: (value: any): boolean => {
    return value === undefined || value === null;
  },
  Number: (value: any): boolean => {
    return typeof value === 'number';
  },
  Object: (value: any): boolean => {
    return typeof value === 'object';
  },
  String: (value: any): boolean => {
    return typeof value === 'string';
  },
  '': (): boolean => {
    return true;
  },
};

for (const typeName in native) {
  if (!typeName) continue;
  // @ts-ignore
  native[typeName].toJSON = ((t: any): any => {
    return t;
  }).bind(null, typeName);
}
