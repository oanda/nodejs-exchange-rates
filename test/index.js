var should = require('chai').should(),
    Client = require('../index');

describe('OANDA Exchange Rates API', function() {
  it('it rocks', function() {
    (new Client()).should.exist;
  });
});
