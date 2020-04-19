"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const Node_1 = require("./Node");
let opts = {};
const configArray = process.env.EMPIRE_CONFIG && process.env.EMPIRE_CONFIG.split(' ');
for (const arg of (configArray || process.argv)) {
    let [key, value] = arg.split('=');
    if (!key || !value) {
        continue;
    }
    if (key === 'config') {
        opts = require(path_1.resolve(process.cwd(), value));
        continue;
    }
    if (value === 'true' || value === 'false') {
        value = value === 'true';
    }
    if (key === 'nodeList') {
        value = value.split(',');
    }
    if (/^[0-9]*$/gm.test(value)) {
        value = Number(value);
    }
    opts[key] = value;
}
exports.node = new Node_1.Node(opts);
//# sourceMappingURL=main.js.map