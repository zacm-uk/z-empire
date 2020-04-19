"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const os_1 = require("os");
const crypto_1 = require("crypto");
const sequelize_1 = require("sequelize");
class SqlStorage {
    constructor({ dialect, username, password, db, ssl, host, port }) {
        this._sequelize = new sequelize_1.Sequelize(dialect === 'sqlite' ? {
            dialect,
            storage: path_1.join(os_1.homedir(), '.z-empire.db')
        } : {
            dialect,
            username,
            password,
            database: db,
            ssl,
            host,
            port,
            dialectOptions: { ssl }
        });
        this._model = class Storage extends sequelize_1.Model {
        };
        this._model.init({
            storageKey: {
                type: sequelize_1.TEXT,
                primaryKey: true,
                unique: true
            },
            value: {
                type: sequelize_1.TEXT
            },
            deletedAt: {
                type: sequelize_1.DATE
            }
        }, { sequelize: this._sequelize });
    }
    _checkConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._sequelize.authenticate();
            yield this._model.sync();
        });
    }
    getAllData() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._checkConnection();
            return this._model.findAll({ raw: true });
        });
    }
    getItem(storageKey) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._checkConnection();
            const obj = yield this._model.findByPk(storageKey, { raw: true });
            return obj ? obj : {
                storageKey,
                value: null,
                createdAt: null,
                updatedAt: null,
                deletedAt: null
            };
        });
    }
    setItem(storageKey, value, generateStorageKey = false) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._checkConnection();
            if (generateStorageKey) {
                const salt = crypto_1.randomBytes(64).toString('hex');
                storageKey = crypto_1.createHash('sha1').update(`${salt}:${storageKey}`).digest('hex');
            }
            const existing = yield this._model.findByPk(storageKey);
            if (existing) {
                yield existing.update({
                    value
                });
            }
            else {
                yield this._model.create({
                    storageKey,
                    value
                });
            }
            return { storageKey };
        });
    }
    removeItem(storageKey) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._checkConnection();
            const existing = yield this._model.findByPk(storageKey);
            if (existing) {
                yield existing.update({
                    value: null,
                    deletedAt: new Date()
                });
            }
        });
    }
    updateInternal(item) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._checkConnection();
            const existing = yield this._model.findByPk(item.storageKey);
            if (!existing) {
                yield this._model.create(item);
            }
            else {
                yield existing.update(item);
            }
        });
    }
    updateInternalBatch(data) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const item of data) {
                yield this.updateInternal(item);
            }
        });
    }
}
exports.SqlStorage = SqlStorage;
//# sourceMappingURL=SqlStorage.js.map