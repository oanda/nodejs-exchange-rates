var OANDAExchangeRates = require('../index');

if (process.argv.length < 4) {
  console.error('Usage: node rates.js <api_key> <base> [<quote>]');
  process.exit(1);
}

var api_key = process.argv[2];
var base = process.argv[3];

var client = new OANDAExchangeRates({ api_key: api_key });

var options;

if (process.argv.length > 4) {
  options = {
    base: base,
    quote: process.argv[4]
  };
} else {
  options = base;
}

client.getRates(options, function(res) {
  if (res.success) {
    for (var quote in res.data.quotes) {
      console.log(base + '/' + quote, '=', res.data.quotes[quote].bid, res.data.quotes[quote].ask);
    }
  } else {
    console.log('error(' + res.errorCode + '):', res.errorMessage);
  }
})
