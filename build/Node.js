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
var http_1 = require("http");
var https_1 = require("https");
var fs_1 = require("fs");
var path_1 = require("path");
var url_1 = require("url");
var moment_1 = require("moment");
var api_1 = require("./api");
var Storage_1 = require("./Storage");
var version = JSON.parse(fs_1.readFileSync(path_1.join(__dirname, '../package.json'), 'utf8')).version;
var NodeType;
(function (NodeType) {
    NodeType["STORAGE"] = "STORAGE";
    NodeType["CLIENT"] = "CLIENT";
})(NodeType = exports.NodeType || (exports.NodeType = {}));
var Node = /** @class */ (function () {
    function Node(_a) {
        var type = _a.type, storageDriver = _a.storageDriver, port = _a.port, _b = _a.nodeList, nodeList = _b === void 0 ? [] : _b, publicAddress = _a.publicAddress, _c = _a.hidden, hidden = _c === void 0 ? false : _c;
        this.lastUpdate = moment_1.utc().toString();
        if (!Node.TYPES[type]) {
            throw new Error('Invalid node type');
        }
        this.type = type;
        this.started = moment_1.utc().toString();
        this.nodeList = new Set(nodeList);
        this.storage = new Storage_1.Storage(storageDriver);
        this.publicAddress = publicAddress || '';
        this.hidden = hidden;
        type === Node.TYPES.STORAGE && this.requestUpdates();
        type === Node.TYPES.STORAGE && port && api_1.startApi(this, port);
    }
    Node.prototype.getInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        publicAddress: this.publicAddress,
                        started: this.started,
                        version: version,
                        type: this.type
                    }];
            });
        });
    };
    Node.prototype.getData = function (storageKey) {
        return __awaiter(this, void 0, void 0, function () {
            var existing;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.storage.getItem(storageKey)];
                    case 1:
                        existing = _a.sent();
                        if (!!existing.createdAt) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.requestUpdates({ storageKey: storageKey })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.storage.getItem(storageKey)];
                    case 3:
                        existing = _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, existing];
                }
            });
        });
    };
    Node.prototype.removeData = function (storageKey) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.storage.removeItem(storageKey)];
                    case 1:
                        _a.sent();
                        this.updateNodes();
                        return [2 /*return*/];
                }
            });
        });
    };
    Node.prototype.setData = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.storage.setItem(key, value, true)];
                    case 1:
                        response = _a.sent();
                        this.updateNodes();
                        return [2 /*return*/, response];
                }
            });
        });
    };
    Node.prototype.updateData = function (storageKey, value) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.storage.setItem(storageKey, value, false)];
                    case 1:
                        response = _a.sent();
                        this.updateNodes();
                        return [2 /*return*/, response];
                }
            });
        });
    };
    Node.prototype.createReplicateRequest = function (_a) {
        var storageKey = (_a === void 0 ? {} : _a).storageKey;
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (storageKey ? this.storage.getItem(storageKey) : this.storage.getAllData())];
                    case 1:
                        data = _b.sent();
                        return [2 /*return*/, {
                                lastUpdate: this.lastUpdate,
                                data: !Array.isArray(data) ? [data] : data
                            }];
                }
            });
        });
    };
    Node.prototype.makeNodeRequest = function (_a) {
        var request = _a.request, body = _a.body, ip = _a.ip, query = _a.query;
        var url = new url_1.URL(ip);
        var reqFn = url.protocol.startsWith('https') ? https_1.request : http_1.request;
        var opts;
        if (request === 'getReplicate') {
            opts = {
                host: url.hostname,
                port: url.port,
                path: '/replicate',
                method: 'GET'
            };
        }
        else if (request === 'sendReplicate') {
            opts = {
                host: url.hostname,
                port: url.port,
                path: '/replicate',
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                }
            };
        }
        if (query) {
            opts.path = opts.path + "?" + query;
        }
        if (!this.hidden && this.type !== Node.TYPES.CLIENT) {
            opts.headers['node-path'] = this.publicAddress;
        }
        return new Promise(function (resolve, reject) {
            var request = reqFn(opts, function (response) {
                var data = '';
                response.on('data', function (chunk) { return data += chunk; });
                response.on('end', function () {
                    var contentType = response.headers['content-type'] || '';
                    if (/json/.test(contentType)) {
                        data = JSON.parse(data);
                    }
                    resolve(data);
                });
            });
            request.on('error', reject);
            body && request.write(body);
            request.end();
        });
    };
    Node.prototype.requestUpdates = function (_a) {
        var storageKey = (_a === void 0 ? {} : _a).storageKey;
        return __awaiter(this, void 0, void 0, function () {
            var _b, _c, ip, body, e_1_1, error_1;
            var e_1, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 10, , 11]);
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 7, 8, 9]);
                        _b = __values(this.nodeList), _c = _b.next();
                        _e.label = 2;
                    case 2:
                        if (!!_c.done) return [3 /*break*/, 6];
                        ip = _c.value;
                        if (ip === this.publicAddress) {
                            return [3 /*break*/, 5];
                        }
                        return [4 /*yield*/, this.makeNodeRequest({
                                request: 'getReplicate',
                                ip: ip,
                                query: "key=" + storageKey
                            })];
                    case 3:
                        body = _e.sent();
                        return [4 /*yield*/, this.receiveUpdate(body)];
                    case 4:
                        _e.sent();
                        _e.label = 5;
                    case 5:
                        _c = _b.next();
                        return [3 /*break*/, 2];
                    case 6: return [3 /*break*/, 9];
                    case 7:
                        e_1_1 = _e.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 9];
                    case 8:
                        try {
                            if (_c && !_c.done && (_d = _b.return)) _d.call(_b);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        error_1 = _e.sent();
                        console.error('Error updating nodes: ', error_1);
                        return [3 /*break*/, 11];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    Node.prototype.updateNodes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var replicateRequest, replicatePromises, _a, _b, ip, error_2;
            var e_2, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        this.lastUpdate = moment_1.utc().toString();
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.createReplicateRequest()];
                    case 2:
                        replicateRequest = _d.sent();
                        replicatePromises = [];
                        try {
                            for (_a = __values(this.nodeList), _b = _a.next(); !_b.done; _b = _a.next()) {
                                ip = _b.value;
                                if (ip === this.publicAddress) {
                                    continue;
                                }
                                replicatePromises.push(this.makeNodeRequest({
                                    request: 'sendReplicate',
                                    ip: ip,
                                    body: JSON.stringify(replicateRequest)
                                }));
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                        return [4 /*yield*/, Promise.all(replicatePromises)];
                    case 3:
                        _d.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _d.sent();
                        console.error('Error updating nodes: ', error_2);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Node.prototype.receiveUpdate = function (_a) {
        var data = _a.data;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        data = data.filter(function (_a) {
                            var createdAt = _a.createdAt;
                            return !!createdAt;
                        });
                        return [4 /*yield*/, this.storage.updateInternalBatch(data)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Node.TYPES = {
        STORAGE: NodeType.STORAGE,
        CLIENT: NodeType.CLIENT
    };
    return Node;
}());
exports.Node = Node;
//# sourceMappingURL=Node.js.map