export declare function getValueTypeName(value: any): string;
export declare function tfJSON(type: any): any;
export declare class TfTypeError extends Error {
    __type: any;
    __value: any;
    __valueTypeName?: string | undefined;
    message: string;
    constructor(__type: any, __value: any, __valueTypeName?: string | undefined);
}
export declare class TfPropertyTypeError extends Error {
    __type: any;
    __property: any;
    __label: any;
    __value: any;
    __valueTypeName?: string | undefined;
    message: string;
    constructor(__type: any, __property: any, __label: any, __value: any, __valueTypeName?: string | undefined);
}
export declare function tfCustomError(expected: any, actual: any): TfTypeError;
export declare function tfSubError(e: Error, property: any, label: any): Error;
