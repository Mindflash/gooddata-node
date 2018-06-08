# gooddata-node
A GoodData API implementation for NodeJS.

## Installation

    npm i gooddata-node

## Usage
```node
const gooddata = require('gooddata-node');

const api = gooddata.create({
  hostname: 'secure.gooddata.com',
  reAuthorizeOnSessionExpire: true,
  retryOnLimitReached: true,
  retryCount: 3,
  maxRetryDelay: 60,
  timeout: 60
});

api.login('username', 'password')
  .then(() => console.log('successful login'))
  .catch(err => console.log(err));
```

### Configuration Object

* hostname: The hostname of your gooddata tenant, or white labeled host. Default: 'secure.gooddata.com'
* reAuthorizeOnSessionExpire: The gooddata auth token last about 10-15 minutes. With this setting enabled the module with try to reauthorize transparently when needed without failing the current api invocation. Default: true
* retryOnLimitReached: If the current api call returns a 429, the module will wait the specified amount of time as read from the response header 'retry-after' and try the request again. Default: true
* retryCount: This is the maximum number of times the module will retry on a 429 before it returns an error. Default: 3
* maxRetryDelay: This is the maximum time in seconds the module will wait to retry on a 429 (overrides 'retry-after' header). Default: 60
* timeout: This is the timeout of any outgoing request attempt. Default: 60

## Development

Feel free to fork this project and submit PR's with new endpoints that we have not yet added. We will be adding documentation and more endpoints in a future update. For now, simply look at the examples in `/src/apis`

