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
const url_1 = require("url");
const routes = {
    'GET /node/info': ({ response, node }) => __awaiter(void 0, void 0, void 0, function* () {
        response.setHeader('content-type', 'application/json');
        response.write(JSON.stringify(yield node.getInfo()));
        response.end();
    }),
    'GET /node/nodelist': ({ response, node }) => {
        response.setHeader('content-type', 'application/json');
        response.write(JSON.stringify([...node.nodeList]));
        response.end();
    },
    'GET /data': ({ response, node, params }) => __awaiter(void 0, void 0, void 0, function* () {
        const storageKey = params.get('key');
        if (!storageKey) {
            throw new Error('No key');
        }
        response.setHeader('content-type', 'application/json');
        response.write(JSON.stringify(yield node.getData(storageKey)));
        response.end();
    }),
    'POST /data': ({ response, node, body }) => __awaiter(void 0, void 0, void 0, function* () {
        const { key, value } = body;
        const { storageKey } = yield node.setData(key, value);
        response.setHeader('content-type', 'application/json');
        response.write(JSON.stringify({ storageKey }));
        response.end();
    }),
    'PUT /data': ({ response, node, body }) => __awaiter(void 0, void 0, void 0, function* () {
        const { storageKey, value } = body;
        yield node.updateData(storageKey, value);
        response.statusCode = 204;
        response.end();
    }),
    'DELETE /data': ({ response, node, body }) => __awaiter(void 0, void 0, void 0, function* () {
        const { storageKey } = body;
        yield node.removeData(storageKey);
        response.statusCode = 204;
        response.end();
    }),
    'POST /replicate': ({ response, node, body }) => __awaiter(void 0, void 0, void 0, function* () {
        yield node.receiveUpdate(body);
        response.statusCode = 204;
        response.end();
    }),
    'GET /replicate': ({ response, node, params }) => __awaiter(void 0, void 0, void 0, function* () {
        const key = params.get('key');
        const body = yield node.createReplicateRequest({ storageKey: key || null });
        response.setHeader('content-type', 'application/json');
        response.write(JSON.stringify(body));
        response.end();
    })
};
exports.startApi = (node, port) => http_1.createServer((request, response) => {
    var _a, _b, _c;
    const [path] = (_b = (_a = request.url) === null || _a === void 0 ? void 0 : _a.split('?')) !== null && _b !== void 0 ? _b : [];
    const params = new url_1.URLSearchParams((_c = request.url) === null || _c === void 0 ? void 0 : _c.replace(path, ''));
    const route = routes[`${request.method} ${path}`];
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET, PUT, DELETE',
        'Access-Control-Max-Age': 2592000
    };
    if (request.method === 'OPTIONS') {
        response.writeHead(204, headers);
        response.end();
        return;
    }
    Object.entries(headers).forEach(([key, value]) => response.setHeader(key, value));
    if (request.headers['node-path']) {
        const nodeIps = request.headers['node-path'].split(',');
        for (const ip of nodeIps) {
            node.nodeList.add(ip);
        }
    }
    if (!route) {
        response.statusCode = 404;
        response.setHeader('content-type', 'application/json');
        response.write(JSON.stringify({ error: 'Not found' }));
        response.end();
        return;
    }
    let data = '';
    request.on('data', chunk => data += chunk);
    request.on('end', () => {
        Promise.resolve()
            .then(() => {
            const contentType = request.headers['content-type'] || '';
            if (/json/.test(contentType)) {
                data = JSON.parse(data);
            }
        })
            .then(() => route({ response, params, node, body: data }))
            .catch(error => {
            response.statusCode = 500;
            response.setHeader('content-type', 'application/json');
            response.write(JSON.stringify({ error: error.message }));
            response.end();
        });
    });
}).listen(process.env.PORT || port);
//# sourceMappingURL=api.js.map