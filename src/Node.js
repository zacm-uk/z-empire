const { request: httpsRequest } = require('https')
const { request: httpRequest } = require('http')

const { utc: moment } = require('moment')

const { startApi } = require('./api')
const { Storage } = require('./Storage')

const { version } = require('../package.json')

class Node {
  constructor({ type, storageDriver, port, nodeList = [], publicAddress, hidden = false }) {
    if (!Node.TYPES[type]) {
      throw new Error('Invalid node type')
    }

    this.type = type
    this.started = moment().toString()
    this.nodeList = new Set(nodeList)
    this.storage = new Storage(storageDriver)
    this.publicAddress = publicAddress
    this.hidden = hidden

    type === Node.TYPES.STORAGE && this.requestUpdates()
    startApi(this, port)
  }

  async getInfo() {
    return {
      publicAddress: this.publicAddress,
      started: this.started,
      version,
      type: this.type
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

  makeNodeRequest({ request, body, ip, query }) {
    const url = new URL(ip)
    const reqFn = url.protocol.startsWith('https') ? httpsRequest : httpRequest

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

    if (!this.hidden) {
      opts.headers['node-path'] = this.publicAddress
    }

    return new Promise((resolve, reject) => {
      const request = reqFn(opts, response => {
        let data = ''
        response.on('data', chunk => data += chunk)
        response.on('end', () => {
          const contentType = response.headers['content-type'] || ''
          if (/json/.test(contentType)) {
            data = JSON.parse(data)
          }
          resolve(data)
        })
      })
      request.on('error', reject)
      body && request.write(body)
      request.end()
    })
  }

  async requestUpdates({ storageKey } = {}) {
    try {
      for (const ip of this.nodeList) {
        if (ip === this.publicAddress) {
          continue
        }
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
    this.lastUpdate = moment().toString()
    try {
      const replicateRequest = await this.createReplicateRequest()
      const replicatePromises = []

      for (const ip of this.nodeList) {
        if (ip === this.publicAddress) {
          continue
        }
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

  static TYPES = {
    STORAGE: 'STORAGE',
    CLIENT: 'CLIENT',
    ROUTER: 'ROUTER'
  }
}

module.exports = {
  Node
}
