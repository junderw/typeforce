import typeforce from './index';

function tfNoThrow(type: any, value: any, strict: boolean): boolean {
  try {
    return typeforce(type, value, strict);
  } catch (e) {
    (tfNoThrow as any).error = e;
    return false;
  }
}

export default Object.assign(tfNoThrow, typeforce);
