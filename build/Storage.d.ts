import { MemoryStorage, SqlStorage } from './storage-drivers';
export declare type StorageDriverType = 'memory' | 'sql';
export declare function Storage(driver: StorageDriverType): MemoryStorage | SqlStorage;
//# sourceMappingURL=Storage.d.ts.map