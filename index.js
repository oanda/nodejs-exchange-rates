var https = require('https');


var ExchangeRates = function ExchangeRates(options) {
  this.options = options || {
    api_key: ''
  };
};

ExchangeRates.prototype.getCurrencies = function(callback) {
  var options = {
    hostname: 'www.oanda.com',
    headers: {
      Authorization: 'Bearer ' + this.options.api_key,
      'User-Agent': 'oanda-exchange-rates.js/0.0.0'
    },
    path: '/rates/api/v1/currencies.json'
  };

  https.get(options, function(httpRes) {
    if (httpRes.statusCode === 200) {
      httpRes.on('data', function(data) {
        // data either a string or a Buffer
        if (Buffer.isBuffer(data)) {
          data = data.toString();
        }
        // now data always a string

        currencyMap = {};
        currencyList = JSON.parse(data).currencies;
        for (var i = 0; i < currencyList.length; i++) {
          var currency = currencyList[i];
          currencyMap[currency.code] = currency.description;
        }

        apiRes = {
          data: {
            currencies: currencyMap
          },
          raw: data,
          success: true
        }

        if (callback != null) {
          callback(apiRes);
        }
      });
    }
  });
};


module.exports = ExchangeRates;
