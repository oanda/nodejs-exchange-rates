## OANDA Exchange Rates API client module for NodeJS

This module provides a simple wrapper around the [OANDA Exchange Rates API](http://www.oanda.com/rates) using NodeJS. Go to the [API documentation page](http://developer.oanda.com/exchange-rates-api/) for a full reference of all the methods. This service requires you to [sign up](http://www.oanda.com/rates/#pricing) for a trial or paying subscription to obtain an API key.

- [Installation](#installation)
- [Usage](#usage)
  - [Class: OANDAExchangeRates](#oanda_exchange_rates)
    - [new OANDAExchangeRates(options)](#constructor)
    - [client.getCurrencies(\[callback\])](#get_currencies)
- [Tests](#tests)
- [Author](#author)
- [Copyright and License](#copyright_license)
- [Release History](#release_history)


## <a name="installation"></a>Installation

    npm install oanda-exchange-rates --save

## <a name="usage"></a>Usage

```javascript
var api = require('oanda-exchange-rates');

var client = new api({
    api_key: 'my_api_key'
});

client.getCurrencies(function(response) {
    if (response.success) {
        console.log(response.data['USD']);
    } else {
        console.log('error(', response.errorCode, ')', response.errorMessage);
    }
});
```

If successful, will output:

    US Dollar

If not, for example:

    error(8) Malformed Authorization header or invalid access token


### <a name="oanda_exchange_rates"></a>Class: OANDAExchangeRates

All API methods return a [Response](#response) object that provides access to the state of the response and has deserialized the JSON data into a native Javascript object.

#### <a name="constructor"></a>new OANDAExchangeRates(options)

The constructor for the API wrapper. Other than `api_key` all other parameters are optional.

- options:
  - api_key

      **required**: the API key provided by the service
  - proxy

          proxy: 'http://your.proxy.com:8080/'

      If you access the service behind a proxy, you can provide it. This sets the proxy for the underlying HTTP client. Similarly, if the `http_proxy` environment variable is set with the proxy, it will be use automatically.

#### <a name="get_currencies"></a>client.getCurencies(\[callback\])

Returns the `/v1/currencies.json` endpoint; a hash of valid currency codes.

**Note**: the endpoint usually returns an array of hashes which contain `code` and `description` keys but `getCurrencies()` massages them into a hash with the `code` as a key and `description` has the value.

The Javascript object returned by `response.data` will look something like this:

```Javascript
{
    CAD: 'Canadian Dollar',
    EUR: 'Euro',
    USD: 'US Dollar',
    ...
}
```

### <a name="response"></a>Class: Response

This object is returned by any API method called in [OANDAExchangeRates](#oanda_exchange_rates). It automatically deserializes the data into a native Javascript object and provides information about the response.

- Fields:
  - data

      Contains the deserialized Javascript object of the API

  - errorCode

      If the request failed due to an API error, contains the error code of the problem (see also [List of Errors](http://developer.oanda.com/exchange-rates-api/#errors_list))
      If the request failed due to a network error (connection lost, malformed JSON data), it will not be set

  - errorMessage

      If the request failed, contains a description of the problem

  - statusCode

      HTTP status code

  - raw
  
      Contains the raw serialized JSON data returned by the API

  - success
  
      Boolean flag indicating whether the request was successful or not


## <a name="tests"></a>Tests

    npm test

## <a name="author"></a>Author

    Jerome Lecomte <jerome@oanda.com>

## <a name="copyright_license"></a>Copyright and License

This software is copyright (c) 2014 by OANDA Corporation and distributed under MIT License.

## <a name="release_history"></a>Release History
