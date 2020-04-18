export type StorageItem = {
  storageKey: string
  value: string | null
  createdAt: string | null
  updatedAt: string | null
  deletedAt: string | null
}

export interface IStorage {
  constructor: Function

  getAllData(): Promise<StorageItem[]>

  getItem(storageKey: string): Promise<StorageItem>

  setItem(storageKey: string, value: string, generateStorageKey?: boolean): Promise<{ storageKey: string }>

  removeItem(storageKey: string): Promise<void>

  updateInternal(item: StorageItem): Promise<void>

  updateInternalBatch(data: StorageItem[]): Promise<void>
}
