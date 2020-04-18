import { join } from 'path'
import { homedir } from 'os'
import { randomBytes, createHash } from 'crypto'

import { Sequelize, Model, TEXT, DATE } from 'sequelize'
import { StorageItem } from './IStorage'

export type SqlStorageOpts = {
  dialect: string
  username?: string
  password?: string
  db?: string
  ssl?: boolean
  host?: string
  port?: string
}

export class SqlStorage {
  private _sequelize: Sequelize
  private _model: (new () => Model<unknown, unknown>) & typeof Model

  constructor({ dialect, username, password, db, ssl, host, port }: SqlStorageOpts) {
    this._sequelize = new (Sequelize as any)(dialect === 'sqlite' ? {
      dialect,
      storage: join(homedir(), '.z-empire.db')
    } : {
      dialect,
      username,
      password,
      database: db,
      ssl,
      host,
      port,
      dialectOptions: { ssl }
    })

    this._model = class Storage extends Model {
    }
    this._model.init({
      storageKey: {
        type: TEXT,
        primaryKey: true,
        unique: true
      },
      value: {
        type: TEXT
      },
      deletedAt: {
        type: DATE
      }
    }, { sequelize: this._sequelize })
  }

  private async _checkConnection() {
    await this._sequelize.authenticate()
    await this._model.sync()
  }

  async getAllData() {
    await this._checkConnection()
    return this._model.findAll({ raw: true })
  }

  async getItem(storageKey: string) {
    await this._checkConnection()
    const obj = await this._model.findByPk(storageKey, { raw: true })
    return obj ? obj : {
      storageKey,
      value: null,
      createdAt: null,
      updatedAt: null,
      deletedAt: null
    }
  }

  async setItem(storageKey: string, value: string, generateStorageKey = false) {
    await this._checkConnection()
    if (generateStorageKey) {
      const salt = randomBytes(64).toString('hex')
      storageKey = createHash('sha1').update(`${ salt }:${ storageKey }`).digest('hex')
    }
    const existing = await this._model.findByPk(storageKey)
    if (existing) {
      await existing.update({
        value
      })
    } else {
      await this._model.create({
        storageKey,
        value
      })
    }

    return { storageKey }
  }

  async removeItem(storageKey: string) {
    await this._checkConnection()
    const existing = await this._model.findByPk(storageKey)
    if (existing) {
      await existing.update({
        value: null,
        deletedAt: new Date()
      })
    }
  }

  async updateInternal(item: StorageItem) {
    await this._checkConnection()
    const existing = await this._model.findByPk(item.storageKey)
    if (!existing) {
      await this._model.create(item)
    } else {
      await existing.update(item)
    }
  }

  async updateInternalBatch(data: StorageItem[]) {
    for (const item of data) {
      await this.updateInternal(item)
    }
  }
}
