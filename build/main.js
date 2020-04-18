"use strict";
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
var e_1, _a;
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var Node_1 = require("./Node");
var opts = {};
var configArray = process.env.EMPIRE_CONFIG && process.env.EMPIRE_CONFIG.split(' ');
try {
    for (var _b = __values((configArray || process.argv)), _c = _b.next(); !_c.done; _c = _b.next()) {
        var arg = _c.value;
        var _d = __read(arg.split('='), 2), key = _d[0], value = _d[1];
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
}
catch (e_1_1) { e_1 = { error: e_1_1 }; }
finally {
    try {
        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
    }
    finally { if (e_1) throw e_1.error; }
}
exports.node = new Node_1.Node(opts);
//# sourceMappingURL=main.js.map