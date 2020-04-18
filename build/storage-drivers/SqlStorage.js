"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var path_1 = require("path");
var os_1 = require("os");
var crypto_1 = require("crypto");
var sequelize_1 = require("sequelize");
var SqlStorage = /** @class */ (function () {
    function SqlStorage(_a) {
        var dialect = _a.dialect, username = _a.username, password = _a.password, db = _a.db, ssl = _a.ssl, host = _a.host, port = _a.port;
        this._sequelize = new sequelize_1.Sequelize(dialect === 'sqlite' ? {
            dialect: dialect,
            storage: path_1.join(os_1.homedir(), '.z-empire.db')
        } : {
            dialect: dialect,
            username: username,
            password: password,
            database: db,
            ssl: ssl,
            host: host,
            port: port,
            dialectOptions: { ssl: ssl }
        });
        this._model = /** @class */ (function (_super) {
            __extends(Storage, _super);
            function Storage() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return Storage;
        }(sequelize_1.Model));
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
    SqlStorage.prototype._checkConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._sequelize.authenticate()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._model.sync()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SqlStorage.prototype.getAllData = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._checkConnection()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this._model.findAll({ raw: true })];
                }
            });
        });
    };
    SqlStorage.prototype.getItem = function (storageKey) {
        return __awaiter(this, void 0, void 0, function () {
            var obj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._checkConnection()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._model.findByPk(storageKey, { raw: true })];
                    case 2:
                        obj = _a.sent();
                        return [2 /*return*/, obj ? obj : {
                                storageKey: storageKey,
                                value: null,
                                createdAt: null,
                                updatedAt: null,
                                deletedAt: null
                            }];
                }
            });
        });
    };
    SqlStorage.prototype.setItem = function (storageKey, value, generateStorageKey) {
        if (generateStorageKey === void 0) { generateStorageKey = false; }
        return __awaiter(this, void 0, void 0, function () {
            var salt, existing;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._checkConnection()];
                    case 1:
                        _a.sent();
                        if (generateStorageKey) {
                            salt = crypto_1.randomBytes(64).toString('hex');
                            storageKey = crypto_1.createHash('sha1').update(salt + ":" + storageKey).digest('hex');
                        }
                        return [4 /*yield*/, this._model.findByPk(storageKey)];
                    case 2:
                        existing = _a.sent();
                        if (!existing) return [3 /*break*/, 4];
                        return [4 /*yield*/, existing.update({
                                value: value
                            })];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, this._model.create({
                            storageKey: storageKey,
                            value: value
                        })];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/, { storageKey: storageKey }];
                }
            });
        });
    };
    SqlStorage.prototype.removeItem = function (storageKey) {
        return __awaiter(this, void 0, void 0, function () {
            var existing;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._checkConnection()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._model.findByPk(storageKey)];
                    case 2:
                        existing = _a.sent();
                        if (!existing) return [3 /*break*/, 4];
                        return [4 /*yield*/, existing.update({
                                value: null,
                                deletedAt: new Date()
                            })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SqlStorage.prototype.updateInternal = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            var existing;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._checkConnection()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._model.findByPk(item.storageKey)];
                    case 2:
                        existing = _a.sent();
                        if (!!existing) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._model.create(item)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, existing.update(item)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    SqlStorage.prototype.updateInternalBatch = function (data) {
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
    return SqlStorage;
}());
exports.SqlStorage = SqlStorage;
//# sourceMappingURL=SqlStorage.js.map