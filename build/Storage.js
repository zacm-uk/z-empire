"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var storage_drivers_1 = require("./storage-drivers");
function Storage(driver) {
    if (driver === 'memory') {
        return new storage_drivers_1.MemoryStorage();
    }
    if (driver === 'sql') {
        return new storage_drivers_1.SqlStorage({
            dialect: process.env.STORAGE_DIALECT,
            username: process.env.STORAGE_USERNAME,
            password: process.env.STORAGE_PASSWORD,
            db: process.env.STORAGE_DB,
            ssl: process.env.STORAGE_SSL !== 'false',
            host: process.env.STORAGE_HOST,
            port: process.env.STORAGE_PORT
        });
    }
    throw new Error('Invalid storage driver');
}
exports.Storage = Storage;
//# sourceMappingURL=Storage.js.map