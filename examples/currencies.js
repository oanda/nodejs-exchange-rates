var OANDAExchangeRates = require('../index');

if (process.argv.length < 3) {
  console.error('Usage: node currencies.js <api_key>');
  process.exit(1);
}

var api_key = process.argv[2];

var client = new OANDAExchangeRates({ api_key: api_key });

client.getCurrencies(function(res) {
  if (res.success) {
    console.log('data =', res.data);
    console.log('raw json =', res.raw);
  }
})
