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

ExchangeRates.prototype._getResponse = function(endpoint, callback) {
  var options = {
    hostname: 'www.oanda.com',
    headers: {
      Authorization: 'Bearer ' + this.api_key,
      'User-Agent': 'oanda-exchange-rates.js/0.0.0'
    },
    path: '/rates/api/v1/' + endpoint + '.json'
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

    // entire response data has arrived and ready to be parsed
    httpRes.on('end', function() {
      apiRes.raw = data;

      try {
        apiRes.data = JSON.parse(data);
        apiRes.success = (httpRes.statusCode === 200);

        // as a convenience, set the code and message in the response wrapper level
        if (!apiRes.success) {
          apiRes.errorCode = apiRes.data.code;
          apiRes.errorMessage = apiRes.data.message;
        }
      } catch (e) {
        apiRes.errorMessage = 'Unable to parse JSON data: ' + e.message;
        apiRes.success = false;
      }

      if (callback != null) {
        callback(apiRes);
      }
    });

    httpRes.on('error', function(e) {
      if (callback != null) {
        callback({
          errorMessage: 'Problem with response: ' + e.message,
          success: false
        });
      }
    });
  });
};

ExchangeRates.prototype.getCurrencies = function(callback) {
  this._getResponse('currencies', function(res) {
    if (res.success) {
      var currencies = {};

      // rearrange the currencies data from an array to a hash for easier use
      for (var i = 0; i < res.data.currencies.length; i++) {
        var currency = res.data.currencies[i];
        currencies[currency.code] = currency.description;
      }

      res.data = currencies;
    }

    if (callback != null) {
      callback(res);
    }
  });
};

ExchangeRates.prototype.getRemainingQuotes = function(callback) {
  this._getResponse('remaining_quotes', callback);
};

module.exports = ExchangeRates;
