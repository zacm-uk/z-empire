import { randomBytes, createHash } from 'crypto'

import { utc as moment } from 'moment'
import { IStorage, StorageItem } from './IStorage'

export class MemoryStorage implements IStorage {
  protected _store: StorageItem[]

  constructor() {
    this._store = []
  }

  async getAllData() {
    return this._store
  }

  async getItem(storageKey: string) {
    const obj = this._store.find(obj => obj.storageKey === storageKey)
    return obj ? { ...obj } : {
      storageKey,
      value: null,
      createdAt: null,
      updatedAt: null,
      deletedAt: null
    }
  }

  async setItem(storageKey: string, value: string, generateStorageKey = false) {
    if (generateStorageKey) {
      const salt = randomBytes(64).toString('hex')
      storageKey = createHash('sha1').update(`${ salt }:${ storageKey }`).digest('hex')
    }
    const obj = this._store.find(obj => obj.storageKey === storageKey) || this._store[this._store.push({
      storageKey,
      value: null,
      createdAt: null,
      updatedAt: null,
      deletedAt: null
    }) - 1]
    obj.updatedAt = moment().toString()
    if (!obj.createdAt) {
      obj.createdAt = obj.updatedAt
    }
    obj.value = value

    return { storageKey }
  }

  async removeItem(storageKey: string) {
    const obj = this._store.find(obj => obj.storageKey === storageKey)
    if (obj) {
      obj.value = null
      obj.updatedAt = moment().toString()
      obj.deletedAt = obj.updatedAt
    }
  }

  async updateInternal(item: StorageItem) {
    const existingIndex = this._store.findIndex(obj => obj.storageKey === item.storageKey)
    const existing = this._store[existingIndex]
    if (existing && moment(existing.updatedAt as string).isAfter(moment(item.updatedAt as string))) {
      return
    }
    if (existingIndex > -1) {
      this._store.splice(existingIndex, 1)
    }
    this._store.push(item)
  }

  async updateInternalBatch(data: StorageItem[]) {
    for (const item of data) {
      await this.updateInternal(item)
    }
  }
}
