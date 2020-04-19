import { MemoryStorage, SqlStorage } from './storage-drivers';
export declare type StorageDriverType = 'memory' | 'sql';
export declare function Storage(driver: StorageDriverType): SqlStorage | MemoryStorage;
//# sourceMappingURL=Storage.d.ts.map