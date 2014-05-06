var OANDAExchangeRates = require('../index');

if (process.argv.length < 3) {
  console.error('Usage: node remainingQuotes.js <api_key>');
  process.exit(1);
}

var api_key = process.argv[2];

var client = new OANDAExchangeRates({ api_key: api_key });

client.getRemainingQuotes(function(res) {
  if (res.success) {
    console.log('Can call getRates()', res.data.remaining_quotes, 'time(s)');
  } else {
    console.log('error(' + res.errorCode + '):', res.errorMessage);
  }
})
