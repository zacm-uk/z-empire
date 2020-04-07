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
    this.started = moment()
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
      started: this.started.toString(),
      version,
      type: this.type
    }
  }

  async getData(storageKey) {
    return await this.storage.getItem(storageKey)
  }

  async removeData(storageKey) {
    this.updateNodes()
    return await this.storage.removeItem(storageKey)
  }

  async setData(key, value) {
    this.updateNodes()
    return await this.storage.setItem(key, value, true)
  }

  async updateData(storageKey, value) {
    this.updateNodes()
    return await this.storage.setItem(storageKey, value, false)
  }

  async createReplicateRequest() {
    const data = await this.storage.getAllData()
    return {
      lastUpdate: this.lastUpdate,
      data
    }
  }

  makeNodeRequest({ request, body, ip }) {
    const url = new URL(ip)
    const reqFn = url.protocol.startsWith('https') ? httpsRequest : httpRequest

    let opts
    if (request.type === 'getReplicate') {
      opts = {
        host: url.hostname,
        port: url.port,
        path: '/replicate',
        method: 'GET',
        headers: {
          'content-type': 'application/json'
        }
      }
    } else if (request.type === 'sendReplicate') {
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

  async requestUpdates() {
    try {
      for (const ip of this.nodeList) {
        if (ip === this.publicAddress) {
          continue
        }
        const body = await this.makeNodeRequest({
          request: 'getReplicate',
          ip
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
        const url = new URL(ip)
        const reqFn = url.protocol.startsWith('https') ? httpRequest : httpRequest

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
