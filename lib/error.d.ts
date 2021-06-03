export interface ChowErrorMeta {
    in: string;
    rawErrors?: Error[];
    code?: number;
}
export default class ChowError extends Error {
    meta: ChowErrorMeta;
    constructor(message: string, meta: ChowErrorMeta);
    toJSON(): {
        code: number;
        location: {
            in: string;
        };
        message: string;
        suggestions: Error[];
    };
}
export declare class RequestValidationError extends ChowError {
    constructor(message: string, meta: ChowErrorMeta);
}
export declare class ResponseValidationError extends ChowError {
    constructor(message: string, meta: ChowErrorMeta);
}
