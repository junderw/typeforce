declare type Checker = (v: any) => boolean;
declare const types: {
    [index: string]: Checker;
};
export default types;
