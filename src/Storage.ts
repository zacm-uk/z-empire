import { MemoryStorage, SqlStorage } from './storage-drivers'

export type StorageDriverType = 'memory' | 'sql'

export function Storage(driver: StorageDriverType) {
  if (driver === 'memory') {
    return new MemoryStorage()
  }
  if (driver === 'sql') {
    return new SqlStorage({
      dialect: process.env.STORAGE_DIALECT as string,
      username: process.env.STORAGE_USERNAME,
      password: process.env.STORAGE_PASSWORD,
      db: process.env.STORAGE_DB,
      ssl: process.env.STORAGE_SSL !== 'false',
      host: process.env.STORAGE_HOST,
      port: process.env.STORAGE_PORT
    })
  }
  throw new Error('Invalid storage driver')
}
