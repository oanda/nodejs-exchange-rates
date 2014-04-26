var should = require('chai').should(),
    sinon = require('sinon'),
    https = require('https')
    OANDAExchangeRates = require('../index');

describe('OANDA Exchange Rates API', function() {

  describe('getCurrencies()', function() {

    describe('when using the API base URL', function() {

      before(function() {
        // Arrange
        sinon.spy(https, 'get')

        var client = new OANDAExchangeRates({
          api_key: '42'
        });

        // Act
        client.getCurrencies();
      });

      // Assert
      it('makes a HTTPS GET request', function() {
        https.get.callCount.should.equal(1);
      });
      it('sends the API\'s base URL as hostname', function() {
        https.get.firstCall.args[0].should.have.property('hostname', 'www.oanda.com');
      });
      it('sends the currencies endpoint as path', function() {
        https.get.firstCall.args[0].should.have.property('path', '/rates/api/v1/currencies.json');
      });
      it('sends the API_key as Authorization header', function() {
        https.get.firstCall.args[0].headers.should.have.property('Authorization', 'Bearer 42');
      });
      it('sends the module name and version as User-Agent header', function() {
        https.get.firstCall.args[0].headers.should.have.property('User-Agent', 'oanda-exchange-rates.js/0.0.0');
      });

      // Restore
      after(function() {
        https.get.restore();
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

    describe('when the request is successful', function() {

      describe('and the response is sent in one chunk', function() {
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
        it('passes a hash of currencies back to our callback', function() {
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

      describe('and the response is sent in multiple chunks', function() {
        var callback = sinon.spy();

        before(function() {
          // Arrange
          sinon.stub(https, 'get').yields(
            _createResponse(200, [
              '{"currencies":[{"code":"ADF","desc',
              'ription":"Andorran Franc"}]}'
            ], callback)
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
        it('passes a hash of currencies back to our callback', function() {
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
    });

    describe('when the request fails', function() {

      describe('due to an API error', function() {
        var callback = sinon.spy();

        before(function() {
          // Arrange
          sinon.stub(https, 'get').yields(_createResponse(400,'{"code":8,"message":"Malformed Authorization header or invalid access token"}', callback));

          var client = new OANDAExchangeRates();

          // Act
          client.getCurrencies(callback);
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
          sinon.stub(https, 'get').yields(_createResponse(200,'{"currencies":[{"code":"ADF","desc', callback));

          var client = new OANDAExchangeRates();

          // Act
          client.getCurrencies(callback);
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
          callback.firstCall.args[0].should.have.property('errorMessage', 'Unable to parse JSON data: Unexpected token d');
        });
        it('passes the raw serialized JSON back to our callback', function() {
          callback.firstCall.args[0].should.have.property('raw', '{"currencies":[{"code":"ADF","desc');
        });

        // Restore
        after(function() {
          https.get.restore();
        });
      });
    });
  });

});
