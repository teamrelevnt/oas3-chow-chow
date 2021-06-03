import Ajv, { Options } from 'ajv';
import addFormats from 'ajv-formats';

export default function ajv(opts: Options = {}) {
  const ajv = new Ajv({
    strict: false,
    ...opts,
  });
  addFormats(ajv);
  return ajv;
}
