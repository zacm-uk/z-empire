import { IStorage, StorageItem } from './IStorage';
export declare class MemoryStorage implements IStorage {
    protected _store: StorageItem[];
    constructor();
    getAllData(): Promise<StorageItem[]>;
    getItem(storageKey: string): Promise<{
        storageKey: string;
        value: string | null;
        createdAt: string | null;
        updatedAt: string | null;
        deletedAt: string | null;
    }>;
    setItem(storageKey: string, value: string, generateStorageKey?: boolean): Promise<{
        storageKey: string;
    }>;
    removeItem(storageKey: string): Promise<void>;
    updateInternal(item: StorageItem): Promise<void>;
    updateInternalBatch(data: StorageItem[]): Promise<void>;
}
//# sourceMappingURL=MemoryStorage.d.ts.map