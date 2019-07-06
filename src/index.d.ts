import * as ERRORS from './errors';
declare function compile(type: any): any;
declare function typeforce(type: any, value: any, strict?: boolean, surrogate?: any): boolean;
declare namespace typeforce {
    var compile: typeof compile;
    var TfTypeError: typeof ERRORS.TfTypeError;
    var TfPropertyTypeError: typeof ERRORS.TfPropertyTypeError;
}
export default typeforce;
