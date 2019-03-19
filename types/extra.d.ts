declare var NATIVE: any;
declare var ERRORS: any;
declare function _Buffer(value: any): boolean;
declare function Hex(value: any): boolean;
declare function _LengthN(type: any, length: any): {
    (value: any): boolean;
    toJSON(): any;
};
declare var _ArrayN: (length: any) => {
    (value: any): boolean;
    toJSON(): any;
};
declare var _BufferN: (length: any) => {
    (value: any): boolean;
    toJSON(): any;
};
declare var _HexN: (length: any) => {
    (value: any): boolean;
    toJSON(): any;
};
declare var _StringN: (length: any) => {
    (value: any): boolean;
    toJSON(): any;
};
declare function Range(a: any, b: any, f: any): {
    (value: any, strict: any): boolean;
    toJSON(): string;
};
declare var INT53_MAX: number;
declare function Finite(value: any): boolean;
declare function Int8(value: any): boolean;
declare function Int16(value: any): boolean;
declare function Int32(value: any): boolean;
declare function Int53(value: any): boolean;
declare function UInt8(value: any): boolean;
declare function UInt16(value: any): boolean;
declare function UInt32(value: any): boolean;
declare function UInt53(value: any): boolean;
declare var types: {
    ArrayN: (length: any) => {
        (value: any): boolean;
        toJSON(): any;
    };
    Buffer: typeof _Buffer;
    BufferN: (length: any) => {
        (value: any): boolean;
        toJSON(): any;
    };
    Finite: typeof Finite;
    Hex: typeof Hex;
    HexN: (length: any) => {
        (value: any): boolean;
        toJSON(): any;
    };
    Int8: typeof Int8;
    Int16: typeof Int16;
    Int32: typeof Int32;
    Int53: typeof Int53;
    Range: {
        new (): Range;
        prototype: Range;
        readonly END_TO_END: number;
        readonly END_TO_START: number;
        readonly START_TO_END: number;
        readonly START_TO_START: number;
    };
    StringN: (length: any) => {
        (value: any): boolean;
        toJSON(): any;
    };
    UInt8: typeof UInt8;
    UInt16: typeof UInt16;
    UInt32: typeof UInt32;
    UInt53: typeof UInt53;
};
