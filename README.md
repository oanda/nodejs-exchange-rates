## NOTE: this repository is deprecated in favour of generating your own API client code using our OpenAPI specification, please refer to the documentation at https://developer.oanda.com/exchange-rates-api/#sample-code

## OANDA Exchange Rates API client module for NodeJS

This module provides a simple wrapper around the [OANDA Exchange Rates API](http://www.oanda.com/rates) using NodeJS. Go to the [API documentation page](http://developer.oanda.com/exchange-rates-api/) for a full reference of all the methods. This service requires you to [sign up](http://www.oanda.com/rates/#pricing) for a trial or paying subscription to obtain an API key.

- [Installation](#installation)
- [Usage](#usage)
  - [Class: OANDAExchangeRates](#oanda_exchange_rates)
    - [new OANDAExchangeRates(options)](#constructor)
    - [client.getCurrencies(\[data_set\], \[callback\])](#get_currencies)
    - [client.getRates(options, \[callback\])](#get_rates)
    - [client.getRemainingQuotes(\[callback\])](#get_remaining_quotes)
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

client.getCurrencies('oanda', function(response) {
    if (response.success) {
        console.log('USD=', response.data['USD']);
    } else {
        console.log('error(', response.errorCode, ')', response.errorMessage);
    }
});

client.getRates('USD', function(response) {
    if (response.success) {
        console.log('daily average USD/GBP:', response.data.quotes.GBP.midpoint);
    } else {
        console.log('error(', response.errorCode, ')', response.errorMessage);
    }
});

client.getRates({ base: 'EUR', quote: 'CAD', date: '2014-01-01' }, function(response) {
    if (response.success) {
        console.log('daily average EUR/CAD on Jan 1st 2014:', response.data.quotes.CAD.midpoint);
    } else {
        console.log('error(', response.errorCode, ')', response.errorMessage);
    }
});

client.getRemainingQuotes(function(response) {
    if (response.success) {
        console.log('Can call getRates()', response.data.remaining_quotes, 'time(s)');
    } else {
        console.log('error(', response.errorCode, ')', response.errorMessage);
    }
});
```

If successful, will output:

    USD=US Dollar
    Daily average USD/GBP: 0.60365
    Daily average EUR/CAD on Jan 1st 2014: 1.46537
    Can call getRates() 100000 time(s)

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

#### <a name="get_currencies"></a>client.getCurencies(\[data_set\], \[callback\])

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

- data_set:

      Indicates which of the OANDA currency list or the European Central Bank currency list to query. Valid values are 'oanda' or 'ecb'

      **DEFAULT:** 'oanda'


#### <a name="get_rates"></a>client.getRates(options, \[callback\])

Returns the `/v1/rates/XXX.json` endpoint; a list of quotes for a specific base currency.

This is the core of the API and provides daily averages, highs, lows and
idpoints for a each cross of currencies.

The Javascript object returned by `response.data` will look something like this --- Please see the [OANDA Exchange Rates API Docs](http://developer.oanda.com/exchange-rates-api) for a detailed breakdown:

```Javascript
{
  "quotes": {
    "GBP": {
      "midpoint": "0.60365",
      "low_bid": "0.60360",
      "low_ask": "0.60369",
      "high_bid": "0.60360",
      "high_ask": "0.60369",
      "date": "2014-01-01T21:00:00+0000",
      "bid": "0.60360",
      "ask": "0.60369"
    },
    "EUR": {
      "midpoint": "0.72527",
      "low_bid": "0.72522",
      "low_ask": "0.72533",
      "high_bid": "0.72522",
      "high_ask": "0.72533",
      "date": "2014-01-01T21:00:00+0000",
      "bid": "0.72522",
      "ask": "0.72533"
    }
  },
  "meta": {
    "skipped_currencies": [],
    "request_time": "2014-05-06T19:23:14+0000",
    "effective_params": {
      "quote_currencies": [
        "EUR",
        "GBP"
      ],
      "fields": [
        "averages",
        "highs",
        "lows",
        "midpoint"
      ],
      "decimal_places": 5,
      "date": "2014-01-01"
    }
  },
  "base_currency": "USD"
}
```

`options` can either be an object or a string. If `options` is a string it will be used as the `base` currency parameter.

- options:
  - base

      **REQUIRED** - The base currency that all quotes are crossed against. Must be a valid
      3 letter upper case currency code as provided by `/v1/currencies.json` endpoint.

          base: 'USD'

  - quote

      A single currency code, or an array of currency codes to cross against the
      base currency.

      **DEFAULT:** All other available currencies.

          quote: 'EUR'
          quote: [ 'EUR', 'GBP', 'CHF' ]

  - data_set

      Indicates which of the OANDA rate or the European Central Bank rate to query. Valid values are 'oanda' or 'ecb'

      **DEFAULT:** 'oanda'

  - decimal_places

      The number of decimal places to provide in the quote. May be a positive integer
      of reasonable size (as of this writing, up to 14) or the string "all".  Quotes
      that are requested with more precision than exist are padded out with zero's.

      **DEFAULT:** 5

          decimal_places: 'all'

  - fields

      Which fields to return in the quotes.  These can currently be:

      - averages - the bid and ask
      - midpoint - the midpoint between the bid and ask
      - highs - the highest bid and ask
      - lows - the lowest bid and ask
      - all - all of the above

      **DEFAULT:** averages

  - date

      The requested date for the quotes. This must be in YYYY-MM-DD format. The
      24 hour period of the date is considered to be that period in UTC.

      **DEFAULT:** The most recent quote

          date: '2014-02-01'

  - start, end

      This allows you to specify a date range. Also in YYYY-MM-DD format. When
      requesting a date range, quotes are modified such that:

      - averages (bid and ask) are the average of the daily values over the date range
      - midpoint (midpoint) is the midpoint between those averages
      - highs (high\_ask and high\_bid) are the highest values over the range
      - lows (low\_ask and low\_bid) are the lowest values over the range

      Specifying no `end` will assume today's date as the end point. Date ranges are
      inclusive (they include all quotes on and between `start` and `end`).

      **DEFAULT:** none

          start: '2014-01-01',
          end: '2014-01-31'


#### <a name="get_remaining_quotes"></a>client.getRemainingQuotes(\[callback\])

Returns the `/v1/remaining_quotes.json` endpoint; the number of quote requests available in the current billing period.

Some plans are limited to a specific number of quotes per billing period. This endpoint can be used to determine how many quotes you have left.

The Javascript object returned by `response.data` will look something like this:

```Javascript
{
  remaining_quotes: 100000
}
```

For plans that have no quote limits, remaining_quotes will equal "unlimited".

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

  - 0.2.0 - June 27 - Add 'data_set' parameter to getCurrencies() and getRates()
  - 0.1.0 - May 7 - Initial release
