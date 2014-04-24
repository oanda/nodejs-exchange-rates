var should = require('chai').should(),
    sinon = require('sinon'),
    https = require('https')
    OANDAExchangeRates = require('../index');

describe('OANDA Exchange Rates API', function() {

  describe('getCurrencies()', function() {
    var callback;

    before(function() {
      // Arrange
      callback = sinon.spy();

      response = {
        statusCode: 200,
        on: function(e, callback) {
          callback(new Buffer('{"currencies":[{"code":"ADF","description":"Andorran Franc"}]}'));
        }
      };
      sinon.stub(https, 'get').yields(response);

      var client = new OANDAExchangeRates({
        api_key: '42'
      });

      // Act
      client.getCurrencies(callback);
    });

    // Assert
    it('makes a HTTPS GET request', function() {
      https.get.callCount.should.equal(1);
    });
    it('sends the API\'s base URL as hostname', function() {
      https.get.firstCall.args[0].hostname.should.equal('www.oanda.com');
    });
    it('sends the currencies endpoint as path', function() {
      https.get.firstCall.args[0].path.should.equal('/rates/api/v1/currencies.json');
    });
    it('sends the API_key as Authorization header', function() {
      https.get.firstCall.args[0].headers.Authorization.should.equal('Bearer 42');
    });
    it('sends the module name and version as User-Agent header', function() {
      https.get.firstCall.args[0].headers['User-Agent'].should.equal('oanda-exchange-rates.js/0.0.0');
    });
    it('calls our callback', function() {
      callback.callCount.should.equal(1);
    });
    it('passes a success flag back to callback', function() {
      callback.firstCall.args[0].success.should.equal(true);
    });
    it('passes a list of currencies back to callback', function() {
      callback.firstCall.args[0].data.should.be.eql({
        currencies: {
          ADF: 'Andorran Franc'
        }
      });
    });
    it('passes the raw serialized JSON back to callback', function() {
      callback.firstCall.args[0].raw.should.equal('{"currencies":[{"code":"ADF","description":"Andorran Franc"}]}');
    });

    // Restore
    after(function() {
      https.get.restore();
    });
  });

});
