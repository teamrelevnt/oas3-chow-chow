"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ajv_1 = require("./ajv");
class CompiledSchema {
    constructor(schema, opts, context) {
        this.schemaObject = schema;
        const ajvInstance = ajv_1.default(opts);
        ajvInstance.removeKeyword('writeOnly');
        ajvInstance.removeKeyword('readOnly');
        ajvInstance.addKeyword({
            keyword: 'writeOnly',
            validate: (schema) => schema ? context.schemaContext === 'request' : true,
        });
        ajvInstance.addKeyword({
            keyword: 'readOnly',
            validate: (schema) => schema ? context.schemaContext === 'response' : true,
        });
        this.validator = ajvInstance.compile(schema);
    }
    validate(value) {
        const valid = this.validator(value);
        if (!valid) {
            /**
             * In the case where betterAjvErrors accidently return 0 errors
             * we return raw errors
             */
            throw this.validator.errors;
        }
    }
}
exports.default = CompiledSchema;
//# sourceMappingURL=CompiledSchema.js.map