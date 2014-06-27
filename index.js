var https = require('https');
var path = require('path');
var proxyAgent = require('https-proxy-agent');
var querystring = require('querystring');
var url = require('url');


var name, version;
require('fs').readFile(path.join(__dirname, 'package.json'), function(err, data) {
  if (err) throw err;
  data = JSON.parse(data);
  name = data.name + '.js';
  version = data.version;
});


var ExchangeRates = function ExchangeRates(options) {
  options = options || {};
  this.api_key = options.api_key;
  this.proxy = options.proxy || process.env.http_proxy;

  if (!this.api_key) {
    throw 'No API key specified';
  }
};

ExchangeRates.prototype._makeProxy = function(url) {
  return new proxyAgent(url)
}

ExchangeRates.prototype._getResponse = function(endpoint, callback) {
  var options = {
    hostname: 'www.oanda.com',
    headers: {
      Authorization: 'Bearer ' + this.api_key,
      'User-Agent': name + '/' + version
    },
    path: '/rates/api/v1/' + endpoint
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

ExchangeRates.prototype.getCurrencies = function(data_set, callback) {
  var endpoint = 'currencies.json';

  if (typeof(data_set) === 'function') {
    callback = data_set;
  } else if (data_set !== undefined) {
    endpoint += '?' + querystring.stringify({'data_set':data_set});
  }

  this._getResponse(endpoint, function(res) {
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
  this._getResponse('remaining_quotes.json', callback);
};

ExchangeRates.prototype.getRates = function(options, callback) {
  var hasOptions = typeof(options) !== 'string';
  var endpoint = 'rates/' + (hasOptions ? options.base : options) + '.json';

  if (hasOptions) {
    delete options.base;

    var query = querystring.stringify(options);
    if (query) {
      endpoint += '?' + query;
    }
  }

  this._getResponse(endpoint, callback);
};

module.exports = ExchangeRates;
