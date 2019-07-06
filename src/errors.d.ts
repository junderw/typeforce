export declare function getValueTypeName(value: any): any;
export declare function tfJSON(type: any): any;
declare function TfTypeError(this: any, type: any, value: any, valueTypeName?: string): any;
declare namespace TfTypeError {
    var prototype: any;
}
export default TfTypeError;
declare function TfPropertyTypeError(this: any, type: any, property: string, label?: string, value?: any, valueTypeName?: string): void;
declare namespace TfPropertyTypeError {
    var prototype: any;
}
export default TfPropertyTypeError;
export declare function tfCustomError(expected: any, actual: any): any;
export declare function tfSubError(e: any, property: string, label?: string): any;
