const { randomBytes, createHash } = require('crypto')

const { utc: moment } = require('moment')

class MemoryStorage {
  constructor() {
    this.store = []
  }

  async getAllData() {
    return this.store
  }

  async getItem(storageKey) {
    const obj = this.store.find(obj => obj.storageKey === storageKey)
    return obj ? { ...obj } : {
      storageKey,
      value: null,
      createdAt: null,
      updatedAt: null,
      deletedAt: null
    }
  }

  async setItem(storageKey, value, generateStorageKey = false) {
    if (generateStorageKey) {
      const salt = randomBytes(64).toString('hex')
      storageKey = createHash('sha1').update(`${ salt }:${ storageKey }`).digest('hex')
    }
    const obj = this.store.find(obj => obj.storageKey === storageKey) || this.store[this.store.push({
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

  async removeItem(storageKey) {
    const obj = this.store.find(obj => obj.storageKey === storageKey)
    if (obj) {
      obj.value = null
      obj.updatedAt = moment().toString()
      obj.deletedAt = obj.updatedAt
    }
  }

  async updateInternal(item) {
    const existingIndex = this.store.findIndex(obj => obj.storageKey === item.storageKey)
    const existing = this.store[existingIndex]
    if (existing && moment(existing.updatedAt).isAfter(moment(item.updatedAt))) {
      return
    }
    if (existingIndex > -1) {
      this.store.splice(existingIndex, 1)
    }
    this.store.push(item)
  }

  async updateInternalBatch(data) {
    for (const item of data) {
      await this.updateInternal(item)
    }
  }
}

module.exports = {
  MemoryStorage
}
