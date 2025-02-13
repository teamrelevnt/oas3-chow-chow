import ChowChow, { ChowOptions } from '../src';
import CompiledOperation from '../src/compiler/CompiledOperation';
import ChowError, { RequestValidationError } from '../src/error';
const fixture = require('./fixtures/pet-store.json');

describe('Pet Store', () => {
  let chowchow: ChowChow;

  beforeAll(() => {
    chowchow = new ChowChow(fixture as any);
  });

  test('It should throw an error if a path is undefined', () => {
    expect(() => {
      chowchow.validateRequest('/undefined', {
        method: 'get',
      });
    }).toThrowError(ChowError);
  });

  test('It should successfully throw an error if a method is undefined', () => {
    expect(() => {
      chowchow.validateRequest('/pets', {
        method: 'put',
      });
    }).toThrowError(ChowError);
  });

  describe('Path', () => {
    test('It should fail validation if provided path parameter is wrong', () => {
      expect(() => {
        chowchow.validateRequest('/pets/chow', {
          method: 'get',
          path: {
            petId: 'chow',
          },
        });
      }).toThrowError(ChowError);
    });

    test('It should pass validation if provided path parameter is correct', () => {
      expect(() => {
        chowchow.validateRequest('/pets/123', {
          method: 'get',
          path: {
            petId: 123,
          },
        });
      }).not.toThrowError();
    });
  });

  describe('Query', () => {
    test('It should fail validation if provided query parameter is wrong', () => {
      expect(() => {
        chowchow.validateRequest('/pets', {
          method: 'get',
          query: {
            limit: 'xyz',
          },
        });
      }).toThrowError(ChowError);
    });

    test('It should pass validation if provided path parameter is correct', () => {
      expect(() => {
        chowchow.validateRequest('/pets', {
          method: 'get',
          query: {
            limit: 50,
          },
        });
      }).not.toThrowError();
    });

    test('It should pass validation if an array is passed to parameter which should be an array', () => {
      expect(() => {
        chowchow.validateRequest('/pets', {
          method: 'get',
          query: {
            breed: ['chowchow'],
          },
        });
      }).not.toThrowError();
    });

    test('It should fail validation if invalid item is passed in enum', () => {
      expect(() => {
        chowchow.validateRequest('/pets', {
          method: 'get',
          query: {
            breed: ['nice dog'],
          },
        });
      }).toThrowError(ChowError);
    });

    test('It should fail validation if number of items exceeds the limit', () => {
      expect(() => {
        chowchow.validateRequest('/pets', {
          method: 'get',
          query: {
            breed: ['chowchow', 'bichon', 'jack russell', 'labrador'],
          },
        });
      }).toThrowError(ChowError);
    });

    test('It should pass validation for valid array parameter', () => {
      expect(() => {
        chowchow.validateRequest('/pets', {
          method: 'get',
          query: {
            breed: ['chowchow', 'bichon', 'labrador'],
          },
        });
      }).not.toThrowError();
    });
  });
  describe('Configure ChowOptions for allErrors', () => {
    test('It should fail validation and receive multiple errors if payload is invalid and ChowOptions configured with allErrors:true', () => {
      let chowOptions: Partial<ChowOptions> = {
        requestBodyAjvOptions: { allErrors: true },
      };
      chowchow = new ChowChow(fixture as any, chowOptions);

      try {
        chowchow.validateRequest('/pets', {
          method: 'post',
          body: {
            name: 123,
          },
          header: {
            'content-type': 'application/json',
          },
        });
      } catch (e) {
        expect(e).toBeDefined();
        expect(e).toBeInstanceOf(ChowError);
        const chowError: ChowError = e;
        expect(chowError.toJSON().suggestions.length).toBe(2);
        expect(
          chowError.meta.rawErrors && chowError.meta.rawErrors.length
        ).toBe(2);
      }
    });

    test('It should fail validation and receive a single error if payload is invalid and ChowOptions configured for allErrors:false', () => {
      let chowOptions: Partial<ChowOptions> = {
        requestBodyAjvOptions: { allErrors: false },
      };
      chowchow = new ChowChow(fixture as any, chowOptions);

      try {
        chowchow.validateRequest('/pets', {
          method: 'post',
          body: {
            name: 123,
          },
          header: {
            'content-type': 'application/json',
          },
        });
      } catch (e) {
        expect(e).toBeDefined();
        expect(e).toBeInstanceOf(ChowError);
        const chowError: ChowError = e;
        expect(chowError.toJSON().suggestions.length).toBe(1);
        expect(
          chowError.meta.rawErrors && chowError.meta.rawErrors.length
        ).toBe(1);
      }
    });

    test('It should fail validation and receive a single error if payload is invalid and ChowOptions not configured', () => {
      chowchow = new ChowChow(fixture as any);

      try {
        chowchow.validateRequest('/pets', {
          method: 'post',
          body: {
            name: 123,
          },
          header: {
            'content-type': 'application/json',
          },
        });
      } catch (e) {
        expect(e).toBeDefined();
        expect(e).toBeInstanceOf(ChowError);
        const chowError: ChowError = e;
        expect(chowError.toJSON().suggestions.length).toBe(1);
        expect(
          chowError.meta.rawErrors && chowError.meta.rawErrors.length
        ).toBe(1);
      }
    });

    test('It should fail validation by operationId and receive a single error if payload is invalid and ChowOptions not configured', () => {
      chowchow = new ChowChow(fixture as any);

      try {
        chowchow.validateRequestByOperationId('createPets', {
          body: {
            name: 123,
          },
          header: {
            'content-type': 'application/json',
          },
        });
      } catch (e) {
        expect(e).toBeDefined();
        expect(e).toBeInstanceOf(ChowError);
        const chowError: ChowError = e;
        expect(chowError.toJSON().suggestions.length).toBe(1);
        expect(
          chowError.meta.rawErrors && chowError.meta.rawErrors.length
        ).toBe(1);
      }
    });

    test('Wrong operation id', () => {
      chowchow = new ChowChow(fixture as any);

      try {
        chowchow.validateRequestByOperationId('createPetsFail', {
          body: {
            name: 123,
          },
          header: {
            'content-type': 'application/json',
          },
        });
      } catch (e) {
        expect(e).toBeDefined();
        expect(e).toBeInstanceOf(ChowError);
        const chowError: ChowError = e;
        expect(chowError.toJSON().suggestions.length).toBe(0);
      }
    });

    test('Unknown error', () => {
      chowchow = new ChowChow(fixture as any);
      // @ts-ignore
      const og = chowchow.identifyCompiledPath;
      try {
        //@ts-ignore
        chowchow.identifyCompiledPath = function () {
          throw new Error('Unknown');
        };
        chowchow.validateRequestByPath('/pets', 'post', {
          body: {
            name: 123,
          },
          header: {
            'content-type': 'application/json',
          },
        });
      } catch (e) {
        // @ts-ignore
        chowchow.identifyCompiledPath = og;
        expect(e).toBeDefined();
        expect(e).not.toBeInstanceOf(ChowError);
      }
    });
    test('Unknown error by operation id', () => {
      chowchow = new ChowChow(fixture as any);
      // @ts-ignore
      const og = CompiledOperation.prototype.validateRequest;
      try {
        //@ts-ignore
        CompiledOperation.prototype.validateRequest = function () {
          throw new Error('Unknown');
        };
        chowchow.validateRequestByOperationId('createPets', {
          body: {
            name: 123,
          },
          header: {
            'content-type': 'application/json',
          },
        });
      } catch (e) {
        // @ts-ignore
        CompiledOperation.prototype.validateRequest = og;
        expect(e).toBeDefined();
        expect(e).not.toBeInstanceOf(ChowError);
      }
    });
  });

  describe('RequestBody', () => {
    test('It should fail validation if payload is invalid', () => {
      expect(() => {
        chowchow.validateRequest('/pets', {
          method: 'post',
          body: {
            name: 'plum',
          },
          header: {
            'content-type': 'application/json',
          },
        });
      }).toThrowError(ChowError);
    });

    test('It should fail validation if invalid mediaType is asked', () => {
      expect(() => {
        chowchow.validateRequest('/pets', {
          method: 'post',
          body: {
            id: 123,
            name: 'plum',
          },
          header: {
            'content-type': 'application/awsome',
          },
        });
      }).toThrowError(ChowError);
    });

    test('It should fail validation if requestBody is required but missing', () => {
      expect(() => {
        chowchow.validateRequest('/pets', {
          method: 'post',
          header: {
            'content-type': 'application/json',
          },
        });
      }).toThrowError(ChowError);
    });

    test('It should fail validation if requestBody is required but Content type is missing', () => {
      expect(() => {
        chowchow.validateRequest('/pets', {
          method: 'post',
        });
      }).toThrowError(ChowError);
    });

    test('It is ok to ignore body if it is not required', () => {
      expect(() => {
        chowchow.validateRequest('/pets/123', {
          method: 'post',
          path: {
            petId: 123,
          },
          header: {
            'content-type': 'application/json',
          },
        });
      }).not.toThrowError();
    });

    test('It should pass validation if valid requestBody is passed', () => {
      expect(() => {
        chowchow.validateRequest('/pets', {
          method: 'post',
          body: {
            id: 123,
            name: 'plum',
            writeOnlyProp: '42',
            notReadOnlyProp: '42',
          },
          header: {
            'content-type': 'application/json',
          },
        });
      }).not.toThrowError();
    });

    test('It should fail validation if requestBody with readOnly property passed', () => {
      expect(() => {
        chowchow.validateRequest('/pets', {
          method: 'post',
          body: {
            id: 123,
            name: 'plum',
            readOnlyProp: '42',
          },
          header: {
            'content-type': 'application/json',
          },
        });
      }).toThrow(RequestValidationError);
    });

    test('It returns defined body content type', () => {
      expect(
        chowchow.getDefinedRequestBodyContentType('/pets', 'post')
      ).toMatchSnapshot();
    });

    test('It returns empty array for defined body content type if path is undefined', () => {
      expect(
        chowchow.getDefinedRequestBodyContentType('/nonono', 'post')
      ).toMatchSnapshot();
    });

    test('It returns empty array for defined body content type if method is undefined', () => {
      expect(
        chowchow.getDefinedRequestBodyContentType('/pets', 'head')
      ).toMatchSnapshot();
    });

    test('It returns empty array for defined body content type if requestBody is not defined', () => {
      expect(
        chowchow.getDefinedRequestBodyContentType('/pets', 'get')
      ).toMatchSnapshot();
    });

    test('Unknown error', () => {
      let err;
      const og = CompiledOperation.prototype.getDefinedRequestBodyContentType;
      CompiledOperation.prototype.getDefinedRequestBodyContentType = function () {
        throw new Error('Uknown');
      };
      try {
        chowchow.getDefinedRequestBodyContentType('/pets', 'get');
      } catch (e) {
        err = e;
      }
      CompiledOperation.prototype.getDefinedRequestBodyContentType = og;
      expect(err).toBeDefined();
    });
  });

  describe('Header', () => {
    test('It should fail validation if a required header is missing', () => {
      expect(() => {
        chowchow.validateRequest('/test/header', {
          method: 'get',
          header: {
            'content-type': 'application/json',
          },
        });
      }).toThrowError(ChowError);
    });

    test('It should fail validation if a header fails schema validation', () => {
      expect(() => {
        chowchow.validateRequest('/test/header', {
          method: 'get',
          header: {
            version: 'awsome version',
          },
        });
      }).toThrowError(ChowError);
    });

    test('It should pass validation if headers are satisfied', () => {
      expect(() => {
        chowchow.validateRequest('/test/header', {
          method: 'get',
          header: {
            version: 123,
          },
        });
      }).not.toThrowError();
    });

    test('It should pass for header without schema', () => {
      expect(() => {
        chowchow.validateRequest('/test/header', {
          method: 'get',
          header: {
            version: 123,
            'no-schema': 123,
          },
        });
      }).not.toThrowError();
    });
  });

  describe('Cookie', () => {
    test('It should fail validation if a required cookie is missing', () => {
      expect(() => {
        chowchow.validateRequest('/test/cookie', {
          method: 'get',
          cookie: {},
        });
      }).toThrowError(ChowError);
    });

    test('It should fail validation if a cookie fails schema validation', () => {
      expect(() => {
        chowchow.validateRequest('/test/cookie', {
          method: 'get',
          cookie: {
            count: 'many',
          },
        });
      }).toThrowError(ChowError);
    });

    test('It should pass validation if cookies are satisfied', () => {
      expect(() => {
        chowchow.validateRequest('/test/cookie', {
          method: 'get',
          cookie: {
            count: 123,
          },
        });
      }).not.toThrowError();
    });
  });

  describe('Schema', () => {
    test('It is ok to not give a schema', () => {
      expect(() => {
        chowchow.validateRequest('/test/schema', {
          method: 'get',
          cookie: {
            count: 123,
          },
        });
      }).not.toThrowError();
    });

    test('It is ok to use wildcards', () => {
      expect(() => {
        chowchow.validateRequest('/test/wildcard', {
          method: 'post',
          body: {
            id: 123,
            name: 'plum',
          },
          header: {
            'content-type': 'application/awesome',
          },
        });
      }).not.toThrowError();
    });

    test('It is ok to fall back to */* when no content type is provided', () => {
      expect(() => {
        chowchow.validateRequest('/test/wildcard', {
          method: 'post',
          body: [
            {
              id: 123,
              name: 'plum',
            },
            {
              id: 456,
              name: 'chow',
            },
          ],
        });
      }).not.toThrowError();
    });
  });

  describe('OperationId', () => {
    test('It should return unique operationId', () => {
      const validatedRequest = chowchow.validateRequest('/pets/123', {
        method: 'get',
        path: {
          petId: 123,
        },
      });
      expect(validatedRequest.operationId).toEqual('showPetById');
    });

    test('It should respect custom operationId', () => {
      const validatedRequest = chowchow.validateRequest('/pets/123', {
        method: 'get',
        operationId: 'customId',
        path: {
          petId: 123,
        },
      });
      expect(validatedRequest.operationId).toEqual('customId');
    });
  });
});
