import { IncomingMessage, request as httpRequest } from 'http'
import { request as httpsRequest } from 'https'
import { readFileSync } from 'fs'
import { join } from 'path'
import { URL } from 'url'

import { utc as moment } from 'moment'

import { startApi } from './api'
import { StorageDriverType, Storage } from './Storage'
import { IStorage } from './storage-drivers'

const { version } = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'))

export enum NodeType {
  STORAGE = 'STORAGE',
  CLIENT = 'CLIENT'
}

export type NodeOpts = {
  type: NodeType
  storageDriver: StorageDriverType
  port?: number
  nodeList?: string[]
  publicAddress?: string
  hidden?: boolean
}

export class Node {
  public readonly type: NodeType
  public readonly started: string
  public nodeList: Set<string>
  public storage: IStorage
  public publicAddress: string
  public hidden: boolean
  public lastUpdate: string = moment().toString()

  constructor({ type, storageDriver, port, nodeList = [], publicAddress, hidden = false }: NodeOpts) {
    if (!Node.TYPES[type]) {
      throw new Error('Invalid node type')
    }

    this.type = type
    this.started = moment().toString()
    this.nodeList = new Set(nodeList)
    this.storage = new (Storage as any)(storageDriver)
    this.publicAddress = publicAddress || ''
    this.hidden = hidden

    type === Node.TYPES.STORAGE && this.requestUpdates()
    type === Node.TYPES.STORAGE && startApi(this, port)
  }

  async getInfo() {
    return {
      publicAddress: this.publicAddress,
      started: this.started,
      version,
      type: this.type
    }
  }

  async getData(storageKey: string) {
    let existing = await this.storage.getItem(storageKey)
    if (!existing.createdAt) {
      await this.requestUpdates({ storageKey })
      existing = await this.storage.getItem(storageKey)
    }
    return existing
  }

  async removeData(storageKey: string, awaitReplicate?: boolean) {
    await this.storage.removeItem(storageKey)
    if (awaitReplicate) {
      await this.updateNodes()
    }
    else {
      this.updateNodes()
    }
  }

  async setData(key: string, value: string, awaitReplicate?: boolean) {
    const response = await this.storage.setItem(key, value, true)
    if (awaitReplicate) {
      await this.updateNodes()
    }
    else {
      this.updateNodes()
    }
    return response
  }

  async updateData(storageKey: string, value: string, awaitReplicate?: boolean) {
    const response = await this.storage.setItem(storageKey, value, false)
    if (awaitReplicate) {
      await this.updateNodes()
    }
    else {
      this.updateNodes()
    }
    return response
  }

  async createReplicateRequest({ storageKey }: { storageKey?: string | null } = {}) {
    const data = await (storageKey ? this.storage.getItem(storageKey) : this.storage.getAllData())
    return {
      lastUpdate: this.lastUpdate,
      data: !Array.isArray(data) ? [ data ] : data
    }
  }

  makeNodeRequest({ request, body, ip, query }: { request: string, body?: string, ip: string, query?: string }) {
    const url = new URL(ip)
    const reqFn = url.protocol.startsWith('https') ? httpsRequest : httpRequest

    let opts: any
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

    if (!this.hidden && this.type !== Node.TYPES.CLIENT) {
      opts.headers['node-path'] = this.publicAddress
    }

    return new Promise((resolve, reject) => {
      const request = reqFn(opts, (response: IncomingMessage) => {
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

  async requestUpdates({ storageKey }: { storageKey?: string } = {}) {
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
        await this.receiveUpdate(body as any)
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

  async receiveUpdate({ data }: { data: any[] }) {
    data = data.filter(({ createdAt }) => !!createdAt)
    await this.storage.updateInternalBatch(data)
  }

  static TYPES: { [key: string]: NodeType } = {
    STORAGE: NodeType.STORAGE,
    CLIENT: NodeType.CLIENT
  }
}
