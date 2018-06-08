const Promise = require('bluebird');
const https = require('https');
const app = require('../../package.json');
const { EventEmitter } = require('events');

class RequestHelper extends EventEmitter {

  constructor(settings) {
    super();

    this.settings = settings;
    this.authProvider = { };

    this.defaultOpts = Object.assign({}, {
      hostname: this.settings.hostname,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': `${app.name}/${app.version} (${app.homepage})`
      }
    });
  }

  registerAuthProvider(auth) {
    this.authProvider = auth;
  }

  request(opts) {
    return new Promise((resolve, reject) => {
      const promise = { resolve, reject };
      let responseBody = '';
      let postData = null;

      const options = Object.assign({}, this.defaultOpts, opts);
      options.headers = Object.assign({}, this.defaultOpts.headers, opts.headers);

      // set authentication header
      if (this.authProvider.authTT) {
        options.headers['X-GDC-AuthTT'] = this.authProvider.authTT;
      }

      // encode payload
      if (options.body) {
        postData = JSON.stringify(options.body);
        options.headers['Content-Length'] = Buffer.byteLength(postData);
        delete options.body;
      }

      const req = https.request(options, res => {
        res.setEncoding('utf8');
        res.on('data', chunk => {
          responseBody += chunk;
        });

        res.on('end', () => {
          this.processResponse({
            res,
            opts,
            options,
            settings: this.settings,
            postData,
            body: responseBody,
            promise
          });
          this.emit('end');
        });
      });

      req.on('error', err => {
        // decorate error with some useful info
        err.opts = options;
        promise.reject(err);
      });

      if (postData) {
        req.write(postData);
      }

      req.end();
    });
  };

  get(path, opts) {
    return this.request(Object.assign({}, opts, {
      path,
      method: 'GET'
    }));
  };

  post(path, opts) {
    return this.request(Object.assign({}, opts, {
      path,
      method: 'POST'
    }));
  };

  put(path, opts) {
    return this.request(Object.assign({}, opts, {
      path,
      method: 'PUT'
    }));
  };

  del(path, opts) {
    return this.request(Object.assign({}, opts, {
      path,
      method: 'DELETE'
    }));
  };

  processResponse(data) {
    // attempt to parse the body
    try {
      data.body = JSON.parse(data.body);
    } catch (e) {
      // doesn't matter, move on
    }

    // merge settings
    data.settings = Object.assign({}, this.settings, data.opts.settings);

    if ([200, 201, 204].includes(data.res.statusCode)) {
      // success, complete promise
      return data.promise.resolve(data.body);
    }

    if (data.res.statusCode === 401) {
      // not authorized
      return this.handleAuthExpired(data);
    }

    if (data.res.statusCode === 429) {
      // rate limit hit
      return this.handleLimitExceeded(data);
    }

    // fail
    this.handleFailure(data);
  };

  handleLimitExceeded(data) {
    // check the retry count
    if (!data.settings.retryOnLimitReached || data.settings.retryCount <= 0) return this.handleFailure(data);

    const retryAfterStr = data.res.headers['retry-after'];
    let retryAfter = data.settings.maxRetryDelay;
    if (retryAfterStr && !isNaN(retryAfterStr)) retryAfter = Math.min(retryAfter, +retryAfterStr);

    // update the retry count and wait for retry
    data.opts.settings = Object.assign({}, data.opts.settings, { retryCount: data.settings.retryCount - 1 });
    setTimeout(() => {
      Promise.resolve()
        .then(() => this.request(data.opts))
        .then(result => data.promise.resolve(result))
        .catch(err => this.handleFailure(data, err));
    }, retryAfter * 1000);
  };

  handleAuthExpired(data) {
    // check re-auth setting
    if (!data.settings.reAuthorizeOnSessionExpire) return this.handleFailure(data);

    // avoid looping, set retry attempt to skip re-auth
    data.opts.settings = Object.assign({}, data.opts.settings, { reAuthorizeOnSessionExpire: false });

    // check gdc session feedback per: https://help.gooddata.com/display/doc/API+Reference#/introduction/use-cases/log-in
    const authFeedback = data.res.headers['www-authenticate'];
    let promise = null;
    if (authFeedback && authFeedback.indexOf('GDCAuthTT') > -1) {
      // we just need a new token
      promise = Promise.resolve()
        .then(() => this.authProvider.getToken());
    } else {
      // we need to re-authenticate
      promise = Promise.resolve()
        .then(() => this.authProvider.login());
    }

    // retry original call
    promise
      .then(() => this.request(data.opts))
      .then(result => data.promise.resolve(result))
      .catch(err => this.handleFailure(data, err));
  };

  handleFailure(data, innerErr) {
    const err = new Error(`Request failed with status: ${data.res.statusCode} - ${data.res.statusMessage}`);
    err.innerError = innerErr;
    err.statusCode = data.res.statusCode;
    err.responseHeaders = data.res.headers;
    err.responseBody = data.body;
    err.requestOptions = data.options;
    if (!data.settings.noLog)
      err.requestContent = data.postData;
    data.promise.reject(err);
  };
}

module.exports = RequestHelper;
