var https = require('https'),
    OANDAExchangeRates = require('../index'),
    should = require('should'),
    sinon = require('sinon');

describe('OANDA Exchange Rates API', function() {

  describe('constructor', function() {

    describe('when the api key is missing', function() {
      var exception = sinon.spy();
      before(function() {
        try {
          var client = new OANDAExchangeRates();
        } catch(e) {
          exception(e);
        }
      });

      it('throws an exception', function() {
        exception.callCount.should.equal(1);
      });
      it('indicates the api key is missing', function() {
        exception.firstCall.args[0].should.equal('No API key specified');
      });
    });
  });

  var _createResponse = function(code, data, callback) {
    if (typeof(data) === 'string') {
      data = [ data ];
    }

    return {
      statusCode: code,
      on: function(evt, callback) {
        if (evt === 'data') {
          data.forEach(function(chunk) {
            callback(new Buffer(chunk));
          });
        }
        if (evt === 'end') {
          callback();
        }
      }
    }
  };

  describe('_getResponse()', function() {

    describe('when using a proxy URL', function() {
      var proxySpy = sinon.spy();

      before(function() {
        // Arrange
        sinon.spy(https, 'get')

        var client = new OANDAExchangeRates({
          api_key: '42',
          proxy: 'http://proxy:8080'
        });

        client.__proto__._makeProxy = proxySpy;

        // Act
        client._getResponse('endpoint');
      });
      // Assert
      it('makes a HTTPS GET request', function() {
        https.get.callCount.should.equal(1);
      });
      it('sends the API\'s base URL as hostname', function() {
        https.get.firstCall.args[0].should.have.property('hostname', 'www.oanda.com');
      });
      it('sends the endpoint as path', function() {
        https.get.firstCall.args[0].should.have.property('path', '/rates/api/v1/endpoint');
      });
      it('sends the API_key as Authorization header', function() {
        https.get.firstCall.args[0].headers.should.have.property('Authorization', 'Bearer 42');
      });
      it('sends the module name and version as User-Agent header', function() {
        https.get.firstCall.args[0].headers.should.have.property('User-Agent', 'oanda-exchange-rates.js/0.0.0');
      });
      it('sends a proxy agent as agent', function() {
        https.get.firstCall.args[0].should.have.property('agent');
      });
      it('creates a proxy agent', function() {
        proxySpy.callCount.should.equal(1);
      });
      it('passes a proxy URL to the proxy agent', function() {
        proxySpy.firstCall.args[0].should.equal('http://proxy:8080');
      });

      // Restore
      after(function() {
        https.get.restore();
      });
    });

    describe('when http_proxy variable is set in the environment', function() {
      var proxySpy = sinon.spy();

      before(function() {
        // Arrange
        sinon.spy(https, 'get')

        process.env.http_proxy = 'http://proxy:8080';

        var client = new OANDAExchangeRates({
          api_key: '42'
        });

        client.__proto__._makeProxy = proxySpy;

        // Act
        client._getResponse('endpoint');
      });
      // Assert
      it('makes a HTTP GET request', function() {
        https.get.callCount.should.equal(1);
      });
      it('sends the API\'s base URL as hostname', function() {
        https.get.firstCall.args[0].should.have.property('hostname', 'www.oanda.com');
      });
      it('sends the endpoint as path', function() {
        https.get.firstCall.args[0].should.have.property('path', '/rates/api/v1/endpoint');
      });
      it('sends the API_key as Authorization header', function() {
        https.get.firstCall.args[0].headers.should.have.property('Authorization', 'Bearer 42');
      });
      it('sends the module name and version as User-Agent header', function() {
        https.get.firstCall.args[0].headers.should.have.property('User-Agent', 'oanda-exchange-rates.js/0.0.0');
      });
      it('sends a proxy agent as agent', function() {
        https.get.firstCall.args[0].should.have.property('agent');
      });
      it('creates a proxy agent', function() {
        proxySpy.callCount.should.equal(1);
      });
      it('passes the proxy URL to the proxy agent', function() {
        proxySpy.firstCall.args[0].should.equal('http://proxy:8080');
      });

      // Restore
      after(function() {
        https.get.restore();
        delete process.env.http_proxy
      });
    });

    describe('when using the API base URL', function() {

      before(function() {
        // Arrange
        sinon.spy(https, 'get')

        var client = new OANDAExchangeRates({
          api_key: '42'
        });

        // Act
        client._getResponse('endpoint');
      });

      // Assert
      it('makes a HTTPS GET request', function() {
        https.get.callCount.should.equal(1);
      });
      it('sends the API\'s base URL as hostname', function() {
        https.get.firstCall.args[0].should.have.property('hostname', 'www.oanda.com');
      });
      it('sends the endpoint as path', function() {
        https.get.firstCall.args[0].should.have.property('path', '/rates/api/v1/endpoint');
      });
      it('sends the API_key as Authorization header', function() {
        https.get.firstCall.args[0].headers.should.have.property('Authorization', 'Bearer 42');
      });
      it('sends the module name and version as User-Agent header', function() {
        https.get.firstCall.args[0].headers.should.have.property('User-Agent', 'oanda-exchange-rates.js/0.0.0');
      });
      it('does not send a HTTP proxy agent as agent', function() {
        https.get.firstCall.args[0].should.not.have.property('agent');
      });

      // Restore
      after(function() {
        https.get.restore();
      });
    });

    describe('when the request is successful', function() {

      describe('and the response is sent in one chunk', function() {
        var callback = sinon.spy();

        before(function() {
          // Arrange
          sinon.stub(https, 'get').yields(
            _createResponse(200, '{"foo":[{"bar":"fubar","fizzy":"fish"}]}', callback)
          );

          var client = new OANDAExchangeRates({
            api_key: '42'
          });

          // Act
          client._getResponse('endpoint', callback);
        });

        // Assert
        it('calls our callback', function() {
          callback.callCount.should.equal(1);
        });
        it('passes a success flag back to our callback', function() {
          callback.firstCall.args[0].should.have.property('success', true);
        });
        it('passes the HTTP status code back to our callback', function() {
          callback.firstCall.args[0].should.have.property('statusCode', 200);
        });
        it('passes the deserialized JSON back to our callback', function() {
          callback.firstCall.args[0].data.should.be.eql({
            foo: [{
              bar: 'fubar',
              fizzy: 'fish'
            }]
          });
        });
        it('passes the raw serialized JSON back to our callback', function() {
          callback.firstCall.args[0].should.have.property('raw', '{"foo":[{"bar":"fubar","fizzy":"fish"}]}');
        });
        it('does not pass any error code back to our callback', function() {
          callback.firstCall.args[0].should.not.have.property('errorCode');
        });
        it('does not pass any error message back to our callback', function() {
          callback.firstCall.args[0].should.not.have.property('errorMessage');
        });

        // Restore
        after(function() {
          https.get.restore();
        });
      });

      describe('and the response is sent in multiple chunks', function() {
        var callback = sinon.spy();

        before(function() {
          // Arrange
          sinon.stub(https, 'get').yields(
            _createResponse(200, [
              '{"foo":[{"bar":"fubar","fiz',
              'zy":"fish"}]}'
            ], callback)
          );

          var client = new OANDAExchangeRates({
            api_key: '42'
          });

          // Act
          client._getResponse('endpoint', callback);
        });

        // Assert
        it('calls our callback', function() {
          callback.callCount.should.equal(1);
        });
        it('passes a success flag back to our callback', function() {
          callback.firstCall.args[0].should.have.property('success', true);
        });
        it('passes the HTTP status code back to our callback', function() {
          callback.firstCall.args[0].should.have.property('statusCode', 200);
        });
        it('passes the deserialized JSON back to our callback', function() {
          callback.firstCall.args[0].data.should.be.eql({
            foo: [{
              bar: 'fubar',
              fizzy: 'fish'
            }]
          });
        });
        it('passes the raw serialized JSON back to our callback', function() {
          callback.firstCall.args[0].should.have.property('raw', '{"foo":[{"bar":"fubar","fizzy":"fish"}]}');
        });
        it('does not pass any error code back to our callback', function() {
          callback.firstCall.args[0].should.not.have.property('errorCode');
        });
        it('does not pass any error message back to our callback', function() {
          callback.firstCall.args[0].should.not.have.property('errorMessage');
        });

        // Restore
        after(function() {
          https.get.restore();
        });
      });
    });

    describe('when the request fails', function() {

      describe('due to an API error', function() {
        var callback = sinon.spy();

        before(function() {
          // Arrange
          sinon.stub(https, 'get').yields(_createResponse(400,'{"code":8,"message":"Malformed Authorization header or invalid access token"}', callback));

          var client = new OANDAExchangeRates({
            api_key: 'expired key'
          });

          // Act
          client._getResponse('endpoint', callback);
        });

        // Assert
        it('calls our callback', function() {
          callback.callCount.should.equal(1);
        });
        it('passes a failure flag back to our callback', function() {
          callback.firstCall.args[0].should.have.property('success', false);
        });
        it('passes the HTTP status code back to our callback', function() {
          callback.firstCall.args[0].should.have.property('statusCode', 400);
        });
        it('passes an error code back to our callback', function() {
          callback.firstCall.args[0].should.have.property('errorCode', 8);
        });
        it('passes an error message back to our callback', function() {
          callback.firstCall.args[0].should.have.property('errorMessage', 'Malformed Authorization header or invalid access token');
        });
        it('passes the raw serialized JSON back to our callback', function() {
          callback.firstCall.args[0].should.have.property('raw', '{"code":8,"message":"Malformed Authorization header or invalid access token"}');
        });

        // Restore
        after(function() {
          https.get.restore();
        });
      });

      describe('due to malformed JSON data', function() {
        var callback = sinon.spy();

        before(function() {
          // Arrange
          sinon.stub(https, 'get').yields(_createResponse(200,'{"foo":[{"bar":"fubar","fizz', callback));

          var client = new OANDAExchangeRates({
            api_key: '42'
          });

          // Act
          client._getResponse('endpoint', callback);
        });

        // Assert
        it('calls our callback', function() {
          callback.callCount.should.equal(1);
        });
        it('passes a failure flag back to our callback', function() {
          callback.firstCall.args[0].should.have.property('success', false);
        });
        it('passes the HTTP status code back to our callback', function() {
          callback.firstCall.args[0].should.have.property('statusCode', 200);
        });
        it('does not pass an error code back to our callback', function() {
          callback.firstCall.args[0].should.not.have.property('errorCode');
        });
        it('passes an error message back to our callback', function() {
          callback.firstCall.args[0].should.have.property('errorMessage', 'Unable to parse JSON data: Unexpected token f');
        });
        it('passes the raw serialized JSON back to our callback', function() {
          callback.firstCall.args[0].should.have.property('raw', '{"foo":[{"bar":"fubar","fizz');
        });

        // Restore
        after(function() {
          https.get.restore();
        });
      });
    });
  });

  describe('getCurrencies', function() {
    var callback = sinon.spy();

    before(function() {
        // Arrange
        sinon.stub(https, 'get').yields(
          _createResponse(200, '{"currencies":[{"code":"ADF","description":"Andorran Franc"}]}', callback)
        );

        var client = new OANDAExchangeRates({
          api_key: '42'
        });

        // Act
        client.getCurrencies(callback);
    });

    // Assert
    it('calls our callback', function() {
      callback.callCount.should.equal(1);
    });
    it('passes a success flag back to our callback', function() {
      callback.firstCall.args[0].should.have.property('success', true);
    });
    it('passes the HTTP status code back to our callback', function() {
      callback.firstCall.args[0].should.have.property('statusCode', 200);
    });
    it('passes a hash of currencies code/description back to our callback', function() {
      callback.firstCall.args[0].data.should.be.eql({
        ADF: 'Andorran Franc'
      });
    });
    it('passes the raw serialized JSON back to our callback', function() {
      callback.firstCall.args[0].should.have.property('raw', '{"currencies":[{"code":"ADF","description":"Andorran Franc"}]}');
    });
    it('does not pass any error code back to our callback', function() {
      callback.firstCall.args[0].should.not.have.property('errorCode');
    });
    it('does not pass any error message back to our callback', function() {
      callback.firstCall.args[0].should.not.have.property('errorMessage');
    });

    // Restore
    after(function() {
      https.get.restore();
    });
  });

  describe('getRemainingQuotes', function() {
    var callback = sinon.spy();

    before(function() {
        // Arrange
        sinon.stub(https, 'get').yields(
          _createResponse(200, '{"remaining_quotes":100000}', callback)
        );

        var client = new OANDAExchangeRates({
          api_key: '42'
        });

        // Act
        client.getRemainingQuotes(callback);
    });

    // Assert
    it('calls our callback', function() {
      callback.callCount.should.equal(1);
    });
    it('passes a success flag back to our callback', function() {
      callback.firstCall.args[0].should.have.property('success', true);
    });
    it('passes the HTTP status code back to our callback', function() {
      callback.firstCall.args[0].should.have.property('statusCode', 200);
    });
    it('passes a hash with a remaining quotes key/value back to our callback', function() {
      callback.firstCall.args[0].data.should.be.eql({
        remaining_quotes: 100000
      });
    });
    it('passes the raw serialized JSON back to our callback', function() {
      callback.firstCall.args[0].should.have.property('raw', '{"remaining_quotes":100000}');
    });
    it('does not pass any error code back to our callback', function() {
      callback.firstCall.args[0].should.not.have.property('errorCode');
    });
    it('does not pass any error message back to our callback', function() {
      callback.firstCall.args[0].should.not.have.property('errorMessage');
    });

    // Restore
    after(function() {
      https.get.restore();
    });
  });

  
  describe('getRates', function() {

    describe('when only the base currency is passed', function() {
      var callback = sinon.spy();

      before(function() {
          // Arrange
          sinon.stub(https, 'get').yields(
            _createResponse(200, '{"quotes":{"CAD":{"date":"2014-05-05T21:00:00+0000","bid":"1.09681","ask":"1.09702"}},"meta":{"skipped_currencies":[],"request_time":"2014-05-06T18:27:56+0000","effective_params":{"quote_currencies":["CAD"],"fields":["averages"],"decimal_places":5,"date":"2014-05-06"}},"base_currency":"USD"}', callback)
          );

          var client = new OANDAExchangeRates({
            api_key: '42'
          });

          // Act
          client.getRates('USD', callback);
      });

      // Assert
      it('sends the base currency as path', function() {
        https.get.firstCall.args[0].should.have.property('path', '/rates/api/v1/rates/USD.json');
      });

      it('calls our callback', function() {
        callback.callCount.should.equal(1);
      });
      it('passes a success flag back to our callback', function() {
        callback.firstCall.args[0].should.have.property('success', true);
      });
      it('passes the HTTP status code back to our callback', function() {
        callback.firstCall.args[0].should.have.property('statusCode', 200);
      });
      it('passes a hash of rates data back to our callback', function() {
        callback.firstCall.args[0].data.should.be.eql({
          "quotes": {
            "CAD": {
              "date": "2014-05-05T21:00:00+0000",
              "bid": "1.09681",
              "ask": "1.09702"
            }
          },
          "meta": {
            "skipped_currencies": [],
            "request_time": "2014-05-06T18:27:56+0000",
            "effective_params": {
              "quote_currencies": [
                "CAD"
              ],
              "fields": [
                "averages"
              ],
              "decimal_places": 5,
              "date": "2014-05-06"
            }
          },
          "base_currency": "USD"
        });
      });
      it('passes the raw serialized JSON back to our callback', function() {
        callback.firstCall.args[0].should.have.property('raw', '{"quotes":{"CAD":{"date":"2014-05-05T21:00:00+0000","bid":"1.09681","ask":"1.09702"}},"meta":{"skipped_currencies":[],"request_time":"2014-05-06T18:27:56+0000","effective_params":{"quote_currencies":["CAD"],"fields":["averages"],"decimal_places":5,"date":"2014-05-06"}},"base_currency":"USD"}');
      });
      it('passes the number of remaining quote any error code back to our callback', function() {
        callback.firstCall.args[0].should.not.have.property('errorCode');
      });
      it('does not pass any error code back to our callback', function() {
        callback.firstCall.args[0].should.not.have.property('errorCode');
      });
      it('does not pass any error message back to our callback', function() {
        callback.firstCall.args[0].should.not.have.property('errorMessage');
      });

      // Restore
      after(function() {
        https.get.restore();
      });
    });

    describe('when optional parameters are passed', function() {
      var callback = sinon.spy();

      before(function() {
          // Arrange
          sinon.stub(https, 'get').yields(
            _createResponse(200, '{"quotes":{"GBP":{"midpoint":"0.60365","low_bid":"0.60360","low_ask":"0.60369","high_bid":"0.60360","high_ask":"0.60369","date":"2014-01-01T21:00:00+0000","bid":"0.60360","ask":"0.60369"},"EUR":{"midpoint":"0.72527","low_bid":"0.72522","low_ask":"0.72533","high_bid":"0.72522","high_ask":"0.72533","date":"2014-01-01T21:00:00+0000","bid":"0.72522","ask":"0.72533"}},"meta":{"skipped_currencies":[],"request_time":"2014-05-06T18:50:57+0000","effective_params":{"quote_currencies":["EUR","GBP"],"fields":["averages","highs","lows","midpoint"],"decimal_places":5,"date":"2014-01-01"}},"base_currency":"USD"}', callback)
          );

          var client = new OANDAExchangeRates({
            api_key: '42'
          });

          var params = {
            base: 'USD',
            quote: ['EUR', 'GBP'],
            fields: 'all',
            date: '2014-01-01'
          }

          // Act
          client.getRates(params, callback);
      });

      // Assert
      it('sends the base currency and query string as path', function() {
        https.get.firstCall.args[0].should.have.property('path', '/rates/api/v1/rates/USD.json?quote=EUR&quote=GBP&fields=all&date=2014-01-01');
      });

      it('calls our callback', function() {
        callback.callCount.should.equal(1);
      });
      it('passes a success flag back to our callback', function() {
        callback.firstCall.args[0].should.have.property('success', true);
      });
      it('passes the HTTP status code back to our callback', function() {
        callback.firstCall.args[0].should.have.property('statusCode', 200);
      });
      it('passes a hash of rates back to our callback', function() {
        callback.firstCall.args[0].data.should.be.eql({
          "quotes": {
            "GBP": {
              "midpoint": "0.60365",
              "low_bid": "0.60360",
              "low_ask": "0.60369",
              "high_bid": "0.60360",
              "high_ask": "0.60369",
              "date": "2014-01-01T21:00:00+0000",
              "bid": "0.60360",
              "ask": "0.60369"
            },
            "EUR": {
              "midpoint": "0.72527",
              "low_bid": "0.72522",
              "low_ask": "0.72533",
              "high_bid": "0.72522",
              "high_ask": "0.72533",
              "date": "2014-01-01T21:00:00+0000",
              "bid": "0.72522",
              "ask": "0.72533"
            }
          },
          "meta": {
            "skipped_currencies": [],
            "request_time": "2014-05-06T18:50:57+0000",
            "effective_params": {
              "quote_currencies": [
                "EUR",
                "GBP"
              ],
              "fields": [
                "averages",
                "highs",
                "lows",
                "midpoint"
              ],
              "decimal_places": 5,
              "date": "2014-01-01"
            }
          },
          "base_currency": "USD"
        });
      });
      it('passes the raw serialized JSON back to our callback', function() {
        callback.firstCall.args[0].should.have.property('raw', '{"quotes":{"GBP":{"midpoint":"0.60365","low_bid":"0.60360","low_ask":"0.60369","high_bid":"0.60360","high_ask":"0.60369","date":"2014-01-01T21:00:00+0000","bid":"0.60360","ask":"0.60369"},"EUR":{"midpoint":"0.72527","low_bid":"0.72522","low_ask":"0.72533","high_bid":"0.72522","high_ask":"0.72533","date":"2014-01-01T21:00:00+0000","bid":"0.72522","ask":"0.72533"}},"meta":{"skipped_currencies":[],"request_time":"2014-05-06T18:50:57+0000","effective_params":{"quote_currencies":["EUR","GBP"],"fields":["averages","highs","lows","midpoint"],"decimal_places":5,"date":"2014-01-01"}},"base_currency":"USD"}');
      });
      it('passes the number of remaining quote any error code back to our callback', function() {
        callback.firstCall.args[0].should.not.have.property('errorCode');
      });
      it('does not pass any error code back to our callback', function() {
        callback.firstCall.args[0].should.not.have.property('errorCode');
      });
      it('does not pass any error message back to our callback', function() {
        callback.firstCall.args[0].should.not.have.property('errorMessage');
      });

      // Restore
      after(function() {
        https.get.restore();
      });
    });
  });
 
});
