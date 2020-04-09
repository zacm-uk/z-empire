const { join } = require('path')
const { homedir } = require('os')
const { randomBytes, createHash } = require('crypto')

const { Sequelize, Model, TEXT, DATE } = require('sequelize')

class SqlStorage {
  constructor({ dialect, username, password, db, ssl, host, port }) {
    this.sequelize = new Sequelize(dialect === 'sqlite' ? { dialect, storage: join(homedir(), '.z-empire.db') } : {
      dialect,
      username,
      password,
      database: db,
      ssl,
      host,
      port
    })

    this.model = class Storage extends Model {
    }
    this.model.init({
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
    }, { sequelize: this.sequelize })
  }

  async _checkConnection() {
    await this.sequelize.authenticate()
    await this.model.sync()
  }

  async getAllData() {
    await this._checkConnection()
    return this.model.findAll({ raw: true })
  }

  async getItem(storageKey) {
    await this._checkConnection()
    const obj = await this.model.findByPk(storageKey, { raw: true })
    return obj ? obj : {
      storageKey,
      value: null,
      createdAt: null,
      updatedAt: null,
      deletedAt: null
    }
  }

  async setItem(storageKey, value, generateStorageKey = false) {
    await this._checkConnection()
    if (generateStorageKey) {
      const salt = randomBytes(64).toString('hex')
      storageKey = createHash('sha1').update(`${ salt }:${ storageKey }`).digest('hex')
    }
    const existing = await this.model.findByPk(storageKey)
    if (existing) {
      await existing.update({
        value
      })
    }
    else {
      await this.model.create({
        storageKey,
        value
      })
    }

    return { storageKey }
  }

  async removeItem(storageKey) {
    await this._checkConnection()
    const existing = await this.model.findByPk(storageKey)
    if (existing) {
      await existing.update({
        value: null,
        deletedAt: new Date()
      })
    }
  }

  async updateInternal(item) {
    await this._checkConnection()
    const existing = await this.model.findByPk(item.storageKey)
    if (!existing) {
      await this.model.create(item)
    }
    else {
      await existing.update(item)
    }
  }

  async updateInternalBatch(data) {
    for (const item of data) {
      await this.updateInternal(item)
    }
  }
}

module.exports = {
  SqlStorage
}
