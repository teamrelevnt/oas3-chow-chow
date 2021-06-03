import ChowChow from '../src';

describe('Option Body', () => {
  it('success with unknown format if unknown format is allowed', () => {
    const fixture = require('./fixtures/option-unknown-fmt.json');

    expect(() => {
      new ChowChow(fixture, {
        responseBodyAjvOptions: { strict: false },
      });
    }).not.toThrow();
  });
});
