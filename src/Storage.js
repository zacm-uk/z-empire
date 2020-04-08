const {MemoryStorage, SqlStorage} = require('./storage-drivers')

function Storage(driver) {
  if (driver === 'memory') {
    return new MemoryStorage()
  }
  if (driver === 'sql') {
    return new SqlStorage({
      dialect: process.env.STORAGE_DIALECT,
      username: process.env.STORAGE_USERNAME,
      password: process.env.STORAGE_PASSWORD,
      db: process.env.STORAGE_DB,
      ssl: process.env.STORAGE_SSL !== 'false'
    })
  }
  throw new Error('Invalid storage driver')
}

module.exports = {
  Storage
}
