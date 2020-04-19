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
const crypto_1 = require("crypto");
const moment_1 = require("moment");
class MemoryStorage {
    constructor() {
        this._store = [];
    }
    getAllData() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._store;
        });
    }
    getItem(storageKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const obj = this._store.find(obj => obj.storageKey === storageKey);
            return obj ? Object.assign({}, obj) : {
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
            if (generateStorageKey) {
                const salt = crypto_1.randomBytes(64).toString('hex');
                storageKey = crypto_1.createHash('sha1').update(`${salt}:${storageKey}`).digest('hex');
            }
            const obj = this._store.find(obj => obj.storageKey === storageKey) || this._store[this._store.push({
                storageKey,
                value: null,
                createdAt: null,
                updatedAt: null,
                deletedAt: null
            }) - 1];
            obj.updatedAt = moment_1.utc().toString();
            if (!obj.createdAt) {
                obj.createdAt = obj.updatedAt;
            }
            obj.value = value;
            return { storageKey };
        });
    }
    removeItem(storageKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const obj = this._store.find(obj => obj.storageKey === storageKey);
            if (obj) {
                obj.value = null;
                obj.updatedAt = moment_1.utc().toString();
                obj.deletedAt = obj.updatedAt;
            }
        });
    }
    updateInternal(item) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingIndex = this._store.findIndex(obj => obj.storageKey === item.storageKey);
            const existing = this._store[existingIndex];
            if (existing && moment_1.utc(existing.updatedAt).isAfter(moment_1.utc(item.updatedAt))) {
                return;
            }
            if (existingIndex > -1) {
                this._store.splice(existingIndex, 1);
            }
            this._store.push(item);
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
exports.MemoryStorage = MemoryStorage;
//# sourceMappingURL=MemoryStorage.js.map