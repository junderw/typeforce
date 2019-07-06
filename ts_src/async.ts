import typeforce from './index';

// async wrapper
function tfAsync(
  type: any,
  value: any,
  strict?: boolean,
  callback?: (...args: any[]) => any,
): void {
  // default to falsy strict if using shorthand overload
  if (typeof strict === 'function') return tfAsync(type, value, false, strict);

  try {
    typeforce(type, value, strict);
  } catch (e) {
    return callback!(e);
  }

  callback!();
}

export default Object.assign(tfAsync, typeforce);
