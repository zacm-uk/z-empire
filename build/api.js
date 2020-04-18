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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
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
var url_1 = require("url");
var routes = {
    'GET /node/info': function (_a) {
        var response = _a.response, node = _a.node;
        return __awaiter(void 0, void 0, void 0, function () {
            var _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        response.setHeader('content-type', 'application/json');
                        _c = (_b = response).write;
                        _e = (_d = JSON).stringify;
                        return [4 /*yield*/, node.getInfo()];
                    case 1:
                        _c.apply(_b, [_e.apply(_d, [_f.sent()])]);
                        response.end();
                        return [2 /*return*/];
                }
            });
        });
    },
    'GET /node/nodelist': function (_a) {
        var response = _a.response, node = _a.node;
        response.setHeader('content-type', 'application/json');
        response.write(JSON.stringify(__spread(node.nodeList)));
        response.end();
    },
    'GET /data': function (_a) {
        var response = _a.response, node = _a.node, params = _a.params;
        return __awaiter(void 0, void 0, void 0, function () {
            var storageKey, _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        storageKey = params.get('key');
                        if (!storageKey) {
                            throw new Error('No key');
                        }
                        response.setHeader('content-type', 'application/json');
                        _c = (_b = response).write;
                        _e = (_d = JSON).stringify;
                        return [4 /*yield*/, node.getData(storageKey)];
                    case 1:
                        _c.apply(_b, [_e.apply(_d, [_f.sent()])]);
                        response.end();
                        return [2 /*return*/];
                }
            });
        });
    },
    'POST /data': function (_a) {
        var response = _a.response, node = _a.node, body = _a.body;
        return __awaiter(void 0, void 0, void 0, function () {
            var key, value, storageKey;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        key = body.key, value = body.value;
                        return [4 /*yield*/, node.setData(key, value)];
                    case 1:
                        storageKey = (_b.sent()).storageKey;
                        response.setHeader('content-type', 'application/json');
                        response.write(JSON.stringify({ storageKey: storageKey }));
                        response.end();
                        return [2 /*return*/];
                }
            });
        });
    },
    'PUT /data': function (_a) {
        var response = _a.response, node = _a.node, body = _a.body;
        return __awaiter(void 0, void 0, void 0, function () {
            var storageKey, value;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        storageKey = body.storageKey, value = body.value;
                        return [4 /*yield*/, node.updateData(storageKey, value)];
                    case 1:
                        _b.sent();
                        response.statusCode = 204;
                        response.end();
                        return [2 /*return*/];
                }
            });
        });
    },
    'DELETE /data': function (_a) {
        var response = _a.response, node = _a.node, body = _a.body;
        return __awaiter(void 0, void 0, void 0, function () {
            var storageKey;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        storageKey = body.storageKey;
                        return [4 /*yield*/, node.removeData(storageKey)];
                    case 1:
                        _b.sent();
                        response.statusCode = 204;
                        response.end();
                        return [2 /*return*/];
                }
            });
        });
    },
    'POST /replicate': function (_a) {
        var response = _a.response, node = _a.node, body = _a.body;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, node.receiveUpdate(body)];
                    case 1:
                        _b.sent();
                        response.statusCode = 204;
                        response.end();
                        return [2 /*return*/];
                }
            });
        });
    },
    'GET /replicate': function (_a) {
        var response = _a.response, node = _a.node, params = _a.params;
        return __awaiter(void 0, void 0, void 0, function () {
            var key, body;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        key = params.get('key');
                        return [4 /*yield*/, node.createReplicateRequest({ storageKey: key || null })];
                    case 1:
                        body = _b.sent();
                        response.setHeader('content-type', 'application/json');
                        response.write(JSON.stringify(body));
                        response.end();
                        return [2 /*return*/];
                }
            });
        });
    }
};
exports.startApi = function (node, port) { return http_1.createServer(function (request, response) {
    var e_1, _a;
    var _b, _c, _d;
    var _e = __read((_c = (_b = request.url) === null || _b === void 0 ? void 0 : _b.split('?')) !== null && _c !== void 0 ? _c : [], 1), path = _e[0];
    var params = new url_1.URLSearchParams((_d = request.url) === null || _d === void 0 ? void 0 : _d.replace(path, ''));
    var route = routes[request.method + " " + path];
    if (request.headers['node-path']) {
        var nodeIps = request.headers['node-path'].split(',');
        try {
            for (var nodeIps_1 = __values(nodeIps), nodeIps_1_1 = nodeIps_1.next(); !nodeIps_1_1.done; nodeIps_1_1 = nodeIps_1.next()) {
                var ip = nodeIps_1_1.value;
                node.nodeList.add(ip);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (nodeIps_1_1 && !nodeIps_1_1.done && (_a = nodeIps_1.return)) _a.call(nodeIps_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    if (!route) {
        response.statusCode = 404;
        response.setHeader('content-type', 'application/json');
        response.write(JSON.stringify({ error: 'Not found' }));
        response.end();
        return;
    }
    var data = '';
    request.on('data', function (chunk) { return data += chunk; });
    request.on('end', function () {
        Promise.resolve()
            .then(function () {
            var contentType = request.headers['content-type'] || '';
            if (/json/.test(contentType)) {
                data = JSON.parse(data);
            }
        })
            .then(function () { return route({ response: response, params: params, node: node, body: data }); })
            .catch(function (error) {
            response.statusCode = 500;
            response.setHeader('content-type', 'application/json');
            response.write(JSON.stringify({ error: error.message }));
            response.end();
        });
    });
}).listen(process.env.PORT || port); };
//# sourceMappingURL=api.js.map