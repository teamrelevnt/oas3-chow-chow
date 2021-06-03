"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ajv_1 = require("ajv");
const ajv_formats_1 = require("ajv-formats");
function ajv(opts = {}) {
    const ajv = new ajv_1.default(Object.assign({ strict: false }, opts));
    ajv_formats_1.default(ajv);
    return ajv;
}
exports.default = ajv;
//# sourceMappingURL=ajv.js.map