OANDA Exchange Rates API client module for nodejs

### Pre-requisite

Sign up for an OANDA Exchange Rates account at [www.oanda.com/rates/](http://www.oanda.com/rates/#pricing)

### Installation

  npm install oanda-exchange-rates --save

### Usage

#### new OANDAExchangeRates(options)

Creates a client to access the OANDA Exchange Rates API.

- options:
  - api_key (required): the API key associated to your OANDA Exchange Rates account (see [Authentication](http://developer.oanda.com/exchange-rates-api/#authentication))

Example:

    var api = require('oanda-exchange-rates');

    var client = new api({
        api_key: 'your_api_key'
    });

#### client.getCurencies(\[callback\])

Get a list of valid three character curreny codes for use in getRates()

- Response fields:
  - success: boolean flag indicating whether the request was successfully answered or not
  - data: object composed of:
    - currencies: object where each key is the three character code of a currency and its associated value is the human description of that currency (important node: this data is organized in the different way than it is in the raw JSON string)
  - raw: JSON string

Example:

    client.getCurrencies(function(res) {
        if (res.success) {
            console.log('data =', res.data);
            console.log('raw json =', res.raw);
        }
    });

Will output:

   data = {
       currencies: {
           ADF: 'Andorran Franc',
           ...
       }
   }
   raw json = {"currencies":[{"code":"ADF","description":"Andorran Franc"},...]}

For complete API reference please checkout the documentation at [developer.oanda.com/exchange-rates-api/](http://developer.oanda.com/exchange-rates-api/)

### Tests

  npm test

### Release History
