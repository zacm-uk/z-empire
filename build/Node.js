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
const http_1 = require("http");
const https_1 = require("https");
const fs_1 = require("fs");
const path_1 = require("path");
const url_1 = require("url");
const moment_1 = require("moment");
const api_1 = require("./api");
const Storage_1 = require("./Storage");
const { version } = JSON.parse(fs_1.readFileSync(path_1.join(__dirname, '../package.json'), 'utf8'));
var NodeType;
(function (NodeType) {
    NodeType["STORAGE"] = "STORAGE";
    NodeType["CLIENT"] = "CLIENT";
})(NodeType = exports.NodeType || (exports.NodeType = {}));
class Node {
    constructor({ type, storageDriver, port, nodeList = [], publicAddress, hidden = false }) {
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
    getInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                publicAddress: this.publicAddress,
                started: this.started,
                version,
                type: this.type
            };
        });
    }
    getData(storageKey) {
        return __awaiter(this, void 0, void 0, function* () {
            let existing = yield this.storage.getItem(storageKey);
            if (!existing.createdAt) {
                yield this.requestUpdates({ storageKey });
                existing = yield this.storage.getItem(storageKey);
            }
            return existing;
        });
    }
    removeData(storageKey) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.storage.removeItem(storageKey);
            this.updateNodes();
        });
    }
    setData(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.storage.setItem(key, value, true);
            this.updateNodes();
            return response;
        });
    }
    updateData(storageKey, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.storage.setItem(storageKey, value, false);
            this.updateNodes();
            return response;
        });
    }
    createReplicateRequest({ storageKey } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield (storageKey ? this.storage.getItem(storageKey) : this.storage.getAllData());
            return {
                lastUpdate: this.lastUpdate,
                data: !Array.isArray(data) ? [data] : data
            };
        });
    }
    makeNodeRequest({ request, body, ip, query }) {
        const url = new url_1.URL(ip);
        const reqFn = url.protocol.startsWith('https') ? https_1.request : http_1.request;
        let opts;
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
            opts.path = `${opts.path}?${query}`;
        }
        if (!this.hidden && this.type !== Node.TYPES.CLIENT) {
            opts.headers['node-path'] = this.publicAddress;
        }
        return new Promise((resolve, reject) => {
            const request = reqFn(opts, (response) => {
                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => {
                    const contentType = response.headers['content-type'] || '';
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
    }
    requestUpdates({ storageKey } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                for (const ip of this.nodeList) {
                    if (ip === this.publicAddress) {
                        continue;
                    }
                    const body = yield this.makeNodeRequest({
                        request: 'getReplicate',
                        ip,
                        query: `key=${storageKey}`
                    });
                    yield this.receiveUpdate(body);
                }
            }
            catch (error) {
                console.error('Error updating nodes: ', error);
            }
        });
    }
    updateNodes() {
        return __awaiter(this, void 0, void 0, function* () {
            this.lastUpdate = moment_1.utc().toString();
            try {
                const replicateRequest = yield this.createReplicateRequest();
                const replicatePromises = [];
                for (const ip of this.nodeList) {
                    if (ip === this.publicAddress) {
                        continue;
                    }
                    replicatePromises.push(this.makeNodeRequest({
                        request: 'sendReplicate',
                        ip,
                        body: JSON.stringify(replicateRequest)
                    }));
                }
                yield Promise.all(replicatePromises);
            }
            catch (error) {
                console.error('Error updating nodes: ', error);
            }
        });
    }
    receiveUpdate({ data }) {
        return __awaiter(this, void 0, void 0, function* () {
            data = data.filter(({ createdAt }) => !!createdAt);
            yield this.storage.updateInternalBatch(data);
        });
    }
}
exports.Node = Node;
Node.TYPES = {
    STORAGE: NodeType.STORAGE,
    CLIENT: NodeType.CLIENT
};
//# sourceMappingURL=Node.js.map