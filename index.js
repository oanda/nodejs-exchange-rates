var proxyAgent = require('https-proxy-agent');
var url = require('url');
var https = require('https');


var ExchangeRates = function ExchangeRates(options) {
  options = options || {};
  this.api_key = options.api_key || '';
  this.proxy = options.proxy || process.env.http_proxy;
};

ExchangeRates.prototype._makeProxy = function(url) {
  return new proxyAgent(url)
}

ExchangeRates.prototype.getCurrencies = function(callback) {
  var options = {
    hostname: 'www.oanda.com',
    headers: {
      Authorization: 'Bearer ' + this.api_key,
      'User-Agent': 'oanda-exchange-rates.js/0.0.0'
    },
    path: '/rates/api/v1/currencies.json'
  };

  if (this.proxy) {
    options.agent = this._makeProxy(this.proxy);
  };

  https.get(options, function(httpRes) {
    var apiRes = {
      statusCode: httpRes.statusCode
    };
    var data = '';

    // buffer response data until it has arrived completely
    httpRes.on('data', function(chunk) {
      // chunk either a string or a Buffer
      if (Buffer.isBuffer(chunk)) {
        chunk = chunk.toString();
      }
      // now chunk always a string
      data += chunk;
    });

    if (httpRes.statusCode === 200) {
      // entire response data has arrived and ready to be parsed
      httpRes.on('end', function() {
        apiRes.raw = data;
        currencyMap = {};

        try {
          currencyList = JSON.parse(data).currencies;
          for (var i = 0; i < currencyList.length; i++) {
            var currency = currencyList[i];
            currencyMap[currency.code] = currency.description;
          }

          apiRes.data = currencyMap;
          apiRes.success = true
        } catch (e) {
          apiRes.errorMessage = 'Unable to parse JSON data: ' + e.message;
          apiRes.success = false;
        }

        if (callback != null) {
          callback(apiRes);
        }
      });
    } else {
      // entire error data has arrived and ready to be parsed
      httpRes.on('end', function() {
        apiRes.raw = data;
        apiRes.success = false;

        try {
          var error = JSON.parse(data);

          apiRes.errorCode = error.code;
          apiRes.errorMessage = error.message;
        } catch (e) {
          apiRes.errorMessage = 'Unable to parse JSON data: ' + e.message;
        }

        if (callback != null) {
          callback(apiRes);
        }
      });
    }
  });
};


module.exports = ExchangeRates;
