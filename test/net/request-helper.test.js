const Promise = require('bluebird');
const { expect, assert } = require('chai');
const { beforeEach, afterEach, describe, it } = require('mocha');
const { stub, createStubInstance, useFakeTimers } = require('sinon');
const nock = require('nock');
const fixtures = require('./request-helper.fixtures');
const RequestHelper = require('../../src/net/request-helper');
const AuthProvider = require('../../src/apis/auth');
const testUtil = require('../test-util');

describe('request-helper', () => {

  describe('with default settings', () => {
    let context = { };

    beforeEach(() => {
      const helper = new RequestHelper({ hostname: fixtures.FX_HOSTNAME });
      const authProvider = createStubInstance(AuthProvider);
      helper.registerAuthProvider(authProvider);
      context = {
        helper,
        authProvider
      };
    });

    afterEach(() => {
      context = { };
      nock.cleanAll();
    });

    it('succeeds on GET with no auth', async () => {
      nock(fixtures.FX_URL_HOSTNAME, { badheaders: ['X-GDC-AuthTT'] })
        .get(fixtures.FX_PATH)
        .reply(200, fixtures.FX_GET_REPLY)

      const result = await context.helper.get(fixtures.FX_PATH);
      expect(result).to.deep.equal(fixtures.FX_GET_REPLY);
    });

    it('succeeds on POST with no auth', async () => {
      const body = {
        test: 1
      };

      nock(fixtures.FX_URL_HOSTNAME, {
        badheaders: ['X-GDC-AuthTT'],
        body
      }).post(fixtures.FX_PATH)
        .reply(200, fixtures.FX_POST_REPLY);

      const result = await context.helper.post(fixtures.FX_PATH, { body });
      expect(result).to.deep.equal(fixtures.FX_POST_REPLY);
    });

    it('succeeds on GET with auth header', async () => {
      context.authProvider.authTT = 'abcd';
      nock(fixtures.FX_URL_HOSTNAME, {
        reqheaders: {
          'X-GDC-AuthTT': context.authProvider.authTT
        }
      }).get(fixtures.FX_PATH)
        .reply(200, fixtures.FX_GET_REPLY);

      const result = await context.helper.get(fixtures.FX_PATH);
      expect(result).to.deep.equal(fixtures.FX_GET_REPLY);
    });

    it('fails gracefully on 400', async () => {
      nock(fixtures.FX_URL_HOSTNAME)
        .get(fixtures.FX_PATH)
        .reply(400, fixtures.FX_ERR_400)

      const err = await testUtil.catch(async () => await context.helper.get(fixtures.FX_PATH));

      expect(err).to.be.an('error');
      expect(err.statusCode).to.equal(400);
      expect(err.responseBody).to.deep.equal(fixtures.FX_ERR_400);
    })
  });

  describe('authentication retry', () => {
    let context = { };

    beforeEach(() => {
      const helper = new RequestHelper({
        hostname: fixtures.FX_HOSTNAME,
        reAuthorizeOnSessionExpire: true
      });
      const authProvider = stub(new AuthProvider());
      authProvider.authTT = '1234';
      helper.registerAuthProvider(authProvider);
      context = {
        helper,
        authProvider
      };
    });

    afterEach(() => {
      context = { };
      nock.cleanAll();
    });

    it('attempts to full login again on 401', async () => {
      context.authProvider.login.callsFake(function() {
        this.authTT = '4321';
      });

      nock(fixtures.FX_URL_HOSTNAME, {
        reqheaders: {
          'X-GDC-AuthTT': '1234'
        }
      }).get(fixtures.FX_PATH)
        .reply(401, { });

      nock(fixtures.FX_URL_HOSTNAME, {
        reqheaders: {
          'X-GDC-AuthTT': '4321'
        }
      }).get(fixtures.FX_PATH)
        .reply(200, fixtures.FX_GET_REPLY);

      const result = await context.helper.get(fixtures.FX_PATH);
      expect(result).to.deep.equal(fixtures.FX_GET_REPLY);
      assert(context.authProvider.login.called, 'login should be called');
    });

    it('attempts to obtain token only on 401', async () => {
      context.authProvider.getToken.callsFake(function() {
        this.authTT = '4321';
      });

      nock(fixtures.FX_URL_HOSTNAME, {
        reqheaders: {
          'X-GDC-AuthTT': '1234'
        }
      }).get(fixtures.FX_PATH)
        .reply(401, { }, {
          'WWW-Authenticate': 'GoodData realm="GoodData API" cookie=GDCAuthTT'
        });

      nock(fixtures.FX_URL_HOSTNAME, {
        reqheaders: {
          'X-GDC-AuthTT': '4321'
        }
      }).get(fixtures.FX_PATH)
        .reply(200, fixtures.FX_GET_REPLY);

      const result = await context.helper.get(fixtures.FX_PATH);
      expect(result).to.deep.equal(fixtures.FX_GET_REPLY);
      assert(!context.authProvider.login.called, 'login should not be called');
      assert(context.authProvider.getToken.called, 'getToken should be called');
    });

    it('does not attempt to full login again with setting off on 401', async () => {
      context.helper.settings.reAuthorizeOnSessionExpire = false;
      context.authProvider.login.callsFake(function() {
        this.authTT = '4321';
      });

      nock(fixtures.FX_URL_HOSTNAME, {
        reqheaders: {
          'X-GDC-AuthTT': '1234'
        }
      }).get(fixtures.FX_PATH)
        .reply(401, { });

      const err = await testUtil.catch(async () => await context.helper.get(fixtures.FX_PATH));

      expect(err).to.be.an('error');
      expect(err.statusCode).to.equal(401);
      assert(!context.authProvider.login.called, 'login should not be called');
    });

    it('does not loop when re-authorizing, try once', async () => {
      context.authProvider.login.callsFake(function() {
        this.authTT = '4321';
      });

      nock(fixtures.FX_URL_HOSTNAME, {
        reqheaders: {
          'X-GDC-AuthTT': '1234'
        }
      }).get(fixtures.FX_PATH)
        .reply(401, { }, {
          'WWW-Authenticate': 'GoodData realm="GoodData API" cookie=GDCAuthSST'
        });

      nock(fixtures.FX_URL_HOSTNAME, {
        reqheaders: {
          'X-GDC-AuthTT': '4321'
        }
      }).get(fixtures.FX_PATH)
        .reply(401, { });

      const err = await testUtil.catch(async () => await context.helper.get(fixtures.FX_PATH));

      expect(err).to.be.an('error');
      expect(err.statusCode).to.equal(401);
      expect(context.authProvider.login.called).to.equal(true);
    });

    it('fails gracefully when re-authorizing fails at login', async () => {
      context.authProvider.login.usingPromise(Promise).rejects(new Error('failed login'));

      nock(fixtures.FX_URL_HOSTNAME, {
        reqheaders: {
          'X-GDC-AuthTT': '1234'
        }
      }).get(fixtures.FX_PATH)
        .reply(401, { }, {
          'WWW-Authenticate': 'GoodData realm="GoodData API" cookie=GDCAuthSST'
        });

      const err = await testUtil.catch(async () => await context.helper.get(fixtures.FX_PATH));

      expect(err).to.be.an('error');
      expect(err.statusCode).to.equal(401);
      expect(err.innerError).to.be.an('error');
      expect(err.innerError.message).to.be.equal('failed login');
      expect(context.authProvider.login.called).to.equal(true);
    });
  });

  describe('limit exceeded retry', () => {
    let context = {};

    beforeEach(() => {
      const helper = new RequestHelper({
        hostname: fixtures.FX_HOSTNAME
      });
      const authProvider = stub(new AuthProvider());
      authProvider.authTT = '1234';
      helper.registerAuthProvider(authProvider);
      context = {
        helper,
        authProvider
      };
    });

    afterEach(() => {
      context = {};
      nock.cleanAll();
    });


    it('attempts correct amount of retries before failure using given wait times between calls', async () => {
      const clock = useFakeTimers();
      Object.assign(context.helper.settings, {
        retryOnLimitReached: true,
        retryCount: 2,
        maxRetryDelay: 5,
      });

      nock(fixtures.FX_URL_HOSTNAME)
        .get(fixtures.FX_PATH)
        .reply(429, { }, {
          'Retry-After': '2'
        })
        .get(fixtures.FX_PATH)
        .reply(429, { }, {
          'Retry-After': '2'
        })
        .get(fixtures.FX_PATH)
        .reply(429, { }, {
          'Retry-After': '2'
        });

      let mocksLeft = 3;

      expect(nock.pendingMocks().length).to.equal(mocksLeft--);

      context.helper.on('end', () => {
        expect(nock.pendingMocks().length).to.equal(mocksLeft);
        if (mocksLeft > 0) {
          mocksLeft--;
          clock.tick(2000);
        }
      });

      const err = await testUtil.catch(async () => await context.helper.get(fixtures.FX_PATH));

      expect(nock.pendingMocks().length).to.equal(mocksLeft);
      expect(err).to.be.an('error');
      expect(err.statusCode).to.equal(429);

      clock.restore();
    });

    it('succeed after correct number of retries', async () => {
      const clock = useFakeTimers();
      Object.assign(context.helper.settings, {
        retryOnLimitReached: true,
        retryCount: 1,
        maxRetryDelay: 5,
      });

      nock(fixtures.FX_URL_HOSTNAME)
        .get(fixtures.FX_PATH)
        .reply(429, { }, {
          'Retry-After': '2'
        })
        .get(fixtures.FX_PATH)
        .reply(200, fixtures.FX_GET_REPLY);

      let mocksLeft = 2;

      expect(nock.pendingMocks().length).to.equal(mocksLeft--);

      context.helper.on('end', () => {
        expect(nock.pendingMocks().length).to.equal(mocksLeft);
        if (mocksLeft > 0) {
          mocksLeft--;
          clock.tick(2000);
        }
      });

      const result = await context.helper.get(fixtures.FX_PATH);

      expect(result).to.deep.equal(fixtures.FX_GET_REPLY);
      expect(nock.pendingMocks().length).to.equal(mocksLeft);

      clock.restore();
    });

    it('succeeds while limiting wait time to maximum set', async () => {
      const clock = useFakeTimers();
      Object.assign(context.helper.settings, {
        retryOnLimitReached: true,
        retryCount: 1,
        maxRetryDelay: 5,
      });

      nock(fixtures.FX_URL_HOSTNAME)
        .get(fixtures.FX_PATH)
        .reply(429, { }, {
          'Retry-After': '20'
        })
        .get(fixtures.FX_PATH)
        .reply(200, fixtures.FX_GET_REPLY);

      let mocksLeft = 2;

      expect(nock.pendingMocks().length).to.equal(mocksLeft--);

      context.helper.on('end', () => {
        expect(nock.pendingMocks().length).to.equal(mocksLeft);
        if (mocksLeft > 0) {
          mocksLeft--;
          clock.tick(5000);
        }
      });

      const result = await context.helper.get(fixtures.FX_PATH);

      expect(result).to.deep.equal(fixtures.FX_GET_REPLY);
      expect(nock.pendingMocks().length).to.equal(mocksLeft);

      clock.restore();
    });

    it('does not retry with setting off', async () => {
      Object.assign(context.helper.settings, {
        retryOnLimitReached: false,
        retryCount: 1,
        maxRetryDelay: 5,
      });

      nock(fixtures.FX_URL_HOSTNAME)
        .get(fixtures.FX_PATH)
        .reply(429, { }, {
          'Retry-After': '20'
        });

      const err = await testUtil.catch(async () => await context.helper.get(fixtures.FX_PATH));

      expect(err).to.be.an('error');
      expect(err.statusCode).to.equal(429);
    });

  });
});

