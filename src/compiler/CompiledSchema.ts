import { SchemaObject } from 'openapi3-ts';
import * as Ajv from 'ajv';
import ajv from './ajv';

export default class CompiledSchema {
  private schemaObject?: SchemaObject;
  private validator: Ajv.ValidateFunction;

  constructor(schema: SchemaObject, opts?: Ajv.Options, context?: any) {
    this.schemaObject = schema;
    const ajvInstance = ajv(opts);
    ajvInstance.removeKeyword('writeOnly');
    ajvInstance.removeKeyword('readOnly');
    ajvInstance.addKeyword({
      keyword: 'writeOnly',
      validate: (schema: any) =>
        schema ? context.schemaContext === 'request' : true,
    });
    ajvInstance.addKeyword({
      keyword: 'readOnly',
      validate: (schema: any) =>
        schema ? context.schemaContext === 'response' : true,
    });
    this.validator = ajvInstance.compile(schema);
  }

  public validate(value: any) {
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
