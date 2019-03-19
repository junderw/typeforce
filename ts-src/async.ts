const typeforce = require('./');

type Callback = (error?: Error, data?: any) => void;

// async wrapper
function tfAsync(
  type: string,
  value: any,
  strict: Callback | boolean,
  callback?: Callback,
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

module.exports = Object.assign(tfAsync, typeforce);

export {};
