"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = require("crypto");
var moment_1 = require("moment");
var MemoryStorage = /** @class */ (function () {
    function MemoryStorage() {
        this._store = [];
    }
    MemoryStorage.prototype.getAllData = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._store];
            });
        });
    };
    MemoryStorage.prototype.getItem = function (storageKey) {
        return __awaiter(this, void 0, void 0, function () {
            var obj;
            return __generator(this, function (_a) {
                obj = this._store.find(function (obj) { return obj.storageKey === storageKey; });
                return [2 /*return*/, obj ? __assign({}, obj) : {
                        storageKey: storageKey,
                        value: null,
                        createdAt: null,
                        updatedAt: null,
                        deletedAt: null
                    }];
            });
        });
    };
    MemoryStorage.prototype.setItem = function (storageKey, value, generateStorageKey) {
        if (generateStorageKey === void 0) { generateStorageKey = false; }
        return __awaiter(this, void 0, void 0, function () {
            var salt, obj;
            return __generator(this, function (_a) {
                if (generateStorageKey) {
                    salt = crypto_1.randomBytes(64).toString('hex');
                    storageKey = crypto_1.createHash('sha1').update(salt + ":" + storageKey).digest('hex');
                }
                obj = this._store.find(function (obj) { return obj.storageKey === storageKey; }) || this._store[this._store.push({
                    storageKey: storageKey,
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
                return [2 /*return*/, { storageKey: storageKey }];
            });
        });
    };
    MemoryStorage.prototype.removeItem = function (storageKey) {
        return __awaiter(this, void 0, void 0, function () {
            var obj;
            return __generator(this, function (_a) {
                obj = this._store.find(function (obj) { return obj.storageKey === storageKey; });
                if (obj) {
                    obj.value = null;
                    obj.updatedAt = moment_1.utc().toString();
                    obj.deletedAt = obj.updatedAt;
                }
                return [2 /*return*/];
            });
        });
    };
    MemoryStorage.prototype.updateInternal = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            var existingIndex, existing;
            return __generator(this, function (_a) {
                existingIndex = this._store.findIndex(function (obj) { return obj.storageKey === item.storageKey; });
                existing = this._store[existingIndex];
                if (existing && moment_1.utc(existing.updatedAt).isAfter(moment_1.utc(item.updatedAt))) {
                    return [2 /*return*/];
                }
                if (existingIndex > -1) {
                    this._store.splice(existingIndex, 1);
                }
                this._store.push(item);
                return [2 /*return*/];
            });
        });
    };
    MemoryStorage.prototype.updateInternalBatch = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var data_1, data_1_1, item, e_1_1;
            var e_1, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, 6, 7]);
                        data_1 = __values(data), data_1_1 = data_1.next();
                        _b.label = 1;
                    case 1:
                        if (!!data_1_1.done) return [3 /*break*/, 4];
                        item = data_1_1.value;
                        return [4 /*yield*/, this.updateInternal(item)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        data_1_1 = data_1.next();
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 7];
                    case 6:
                        try {
                            if (data_1_1 && !data_1_1.done && (_a = data_1.return)) _a.call(data_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return MemoryStorage;
}());
exports.MemoryStorage = MemoryStorage;
//# sourceMappingURL=MemoryStorage.js.map