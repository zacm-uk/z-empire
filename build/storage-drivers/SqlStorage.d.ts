import { Model } from 'sequelize';
import { StorageItem } from './IStorage';
export declare type SqlStorageOpts = {
    dialect: string;
    username?: string;
    password?: string;
    db?: string;
    ssl?: boolean;
    host?: string;
    port?: string;
};
export declare class SqlStorage {
    private _sequelize;
    private _model;
    constructor({ dialect, username, password, db, ssl, host, port }: SqlStorageOpts);
    private _checkConnection;
    getAllData(): Promise<Model<unknown, unknown>[]>;
    getItem(storageKey: string): Promise<Model<unknown, unknown> | {
        storageKey: string;
        value: null;
        createdAt: null;
        updatedAt: null;
        deletedAt: null;
    }>;
    setItem(storageKey: string, value: string, generateStorageKey?: boolean): Promise<{
        storageKey: string;
    }>;
    removeItem(storageKey: string): Promise<void>;
    updateInternal(item: StorageItem): Promise<void>;
    updateInternalBatch(data: StorageItem[]): Promise<void>;
}
//# sourceMappingURL=SqlStorage.d.ts.map