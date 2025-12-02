import type { AttributeCon, ISigningKey } from '@e4a/pg-wasm'

export enum EncryptionState {
    FileSelection = 1,
    Encrypting,
    Done,
    Error,
    Sign,
}

export type EncryptState = {
    recipients: { email: string; extra: AttributeCon }[];
    sender: string;
    message: string;
    files: File[];
    percentages: number[];
    done: boolean[];
    encryptionState: EncryptionState;
    abort: AbortController;
    selfAborted: boolean;
    encryptStartTime: number;
    modPromise: Promise<any>;
    pkPromise: Promise<any>;
    pubSignKey?: ISigningKey;
    privSignKey?: ISigningKey;
    senderAttributes: AttributeCon;
    senderConfirm: boolean;
};

export type AttType =
    | "pbdf.sidn-pbdf.mobilenumber.mobilenumber"
    | "pbdf.gemeente.personalData.fullname"
    | "pbdf.gemeente.personalData.dateofbirth";