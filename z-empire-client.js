const momentLoaded = fetch('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js')
  .then(res => res.text())
  .then(script => eval(script))

const sha1Loaded = fetch('https://cdnjs.cloudflare.com/ajax/libs/js-sha1/0.6.0/sha1.min.js')
  .then(res => res.text())
  .then(script => eval(script))

window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB,
  IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction

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
      const salt = Math.random().toString(36).substring(7)
      await sha1Loaded
      storageKey = sha1(`${ salt }:${ storageKey }`)
    }
    const obj = this.store.find(obj => obj.storageKey === storageKey) || this.store[this.store.push({
      storageKey,
      value: null,
      createdAt: null,
      updatedAt: null,
      deletedAt: null
    }) - 1]
    await momentLoaded
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
      await momentLoaded
      obj.updatedAt = moment().toString()
      obj.deletedAt = obj.updatedAt
    }
  }

  async updateInternal(item) {
    await momentLoaded
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

function Storage(driver) {
  if (driver === 'memory') {
    return new MemoryStorage()
  }
  throw new Error('Invalid storage driver')
}


class WebClient {
  constructor({ storageDriver, nodeList = [] }) {
    momentLoaded.then(() => {
      this.started = moment().toString()
    })
    this.nodeList = new Set(nodeList)
    this.storage = new Storage(storageDriver)
  }

  async getInfo() {
    return {
      started: this.started
    }
  }

  async getData(storageKey) {
    let existing = await this.storage.getItem(storageKey)
    if (!existing.createdAt) {
      await this.requestUpdates({ storageKey })
      existing = await this.storage.getItem(storageKey)
    }
    return existing
  }

  async removeData(storageKey) {
    await this.storage.removeItem(storageKey)
    this.updateNodes()
  }

  async setData(key, value) {
    const response = await this.storage.setItem(key, value, true)
    this.updateNodes()
    return response
  }

  async updateData(storageKey, value) {
    const response = await this.storage.setItem(storageKey, value, false)
    this.updateNodes()
    return response
  }

  async createReplicateRequest({ storageKey } = {}) {
    const data = await (storageKey ? this.storage.getItem(storageKey) : this.storage.getAllData())
    return {
      lastUpdate: this.lastUpdate,
      data: !Array.isArray(data) ? [ data ] : data
    }
  }

  async makeNodeRequest({ request, body, ip, query }) {
    const url = new URL(ip)
    const reqProto = url.protocol.startsWith('https') ? 'https' : 'http'

    let opts
    if (request === 'getReplicate') {
      opts = {
        host: url.hostname,
        port: url.port,
        path: '/replicate',
        method: 'GET'
      }
    } else if (request === 'sendReplicate') {
      opts = {
        host: url.hostname,
        port: url.port,
        path: '/replicate',
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        }
      }
    }

    if (query) {
      opts.path = `${ opts.path }?${ query }`
    }

    const response = await fetch(`${ reqProto }://${ opts.host }:${ opts.port }/${ opts.path }`, {
      method: opts.method,
      headers: opts.headers,
      ...body && { body }
    })
    let resBody
    if (/json/.test(response.headers.get('content-type'))) {
      resBody = await response.json()
    } else {
      resBody = await response.text()
    }

    return resBody
  }

  async requestUpdates({ storageKey } = {}) {
    try {
      for (const ip of this.nodeList) {
        const body = await this.makeNodeRequest({
          request: 'getReplicate',
          ip,
          query: `key=${ storageKey }`
        })
        await this.receiveUpdate(body)
      }
    } catch (error) {
      console.error('Error updating nodes: ', error)
    }
  }

  async updateNodes() {
    await momentLoaded
    this.lastUpdate = moment().toString()
    try {
      const replicateRequest = await this.createReplicateRequest()
      const replicatePromises = []

      for (const ip of this.nodeList) {
        replicatePromises.push(this.makeNodeRequest({
          request: 'sendReplicate',
          ip,
          body: JSON.stringify(replicateRequest)
        }))
      }

      await Promise.all(replicatePromises)
    } catch (error) {
      console.error('Error updating nodes: ', error)
    }
  }

  async receiveUpdate({ data }) {
    data = data.filter(({ createdAt }) => !!createdAt)
    await this.storage.updateInternalBatch(data)
  }
}

let client

Object.defineProperties(window, {
  EmpireClient: {
    value: WebClient,
    enumerable: true,
    configurable: false
  },
  defaultEmpireClient: {
    get() {
      if (client) {
        return client
      }
      return new WebClient({
        storageDriver: 'memory',
        nodeList: [ 'https://empire.zacm.uk' ]
      })
    }
  }
})
