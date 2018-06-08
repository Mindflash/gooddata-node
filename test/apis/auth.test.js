const Promise = require('bluebird');
const { expect } = require('chai');
const { beforeEach, afterEach, describe, it } = require('mocha');
const { createStubInstance } = require('sinon');
const fixtures = require('./auth.fixtures');
const RequestHelper = require('../../src/net/request-helper');
const RouteHelper = require('../../src/util/route-helper');
const Auth = require('../../src/apis/auth');
const authRoutes = require('../../src/apis/auth-routes');

describe('auth api', () => {
  let context = { };

  beforeEach(() => {
    const requestHelper = createStubInstance(RequestHelper);
    const routeHelper = createStubInstance(RouteHelper);
    context = {
      requestHelper,
      routeHelper,
      auth: new Auth(requestHelper, routeHelper)
    };
  });

  afterEach(() => {
    context = { };
  });

  it('conducts login sequence properly in successful conditions', async () => {
    const { routeHelper, requestHelper, auth } = context;
    routeHelper.interpolate.withArgs(authRoutes.LOGIN).returns(fixtures.FX_ROUTE_1);
    routeHelper.interpolate.withArgs(authRoutes.GET_TOKEN).returns(fixtures.FX_ROUTE_2);
    requestHelper.post
      .withArgs(fixtures.FX_ROUTE_1, fixtures.FX_LOGIN_PAYLOAD)
      .usingPromise(Promise)
      .resolves(fixtures.FX_LOGIN_RESULT_1);
    requestHelper.get.usingPromise(Promise).resolves(fixtures.FX_TOKEN_RESULT_1);

    await auth.login(fixtures.FX_USERNAME, fixtures.FX_PASSWORD);

    expect(routeHelper.interpolate.called).to.equal(true);
    expect(auth.authSST).to.equal(fixtures.FX_AUTH_SST_1);
    expect(auth.authTT).to.equal(fixtures.FX_AUTH_TT_1);
    expect(auth.username).to.equal(fixtures.FX_USERNAME);
    expect(auth.password).to.equal(fixtures.FX_PASSWORD);
  });

  it('conducts login sequence properly in succession without user pass', async () => {
    const { routeHelper, requestHelper, auth } = context;
    routeHelper.interpolate.withArgs(authRoutes.LOGIN).returns(fixtures.FX_ROUTE_1);
    routeHelper.interpolate.withArgs(authRoutes.GET_TOKEN).returns(fixtures.FX_ROUTE_2);
    requestHelper.post
      .withArgs(fixtures.FX_ROUTE_1, fixtures.FX_LOGIN_PAYLOAD)
      .usingPromise(Promise)
      .resolves(fixtures.FX_LOGIN_RESULT_1);
    requestHelper.get.usingPromise(Promise).resolves(fixtures.FX_TOKEN_RESULT_1);

    await auth.login(fixtures.FX_USERNAME, fixtures.FX_PASSWORD);

    expect(routeHelper.interpolate.called).to.equal(true);
    expect(auth.authSST).to.equal(fixtures.FX_AUTH_SST_1);
    expect(auth.authTT).to.equal(fixtures.FX_AUTH_TT_1);

    // setup for second call
    routeHelper.interpolate.resetHistory();
    requestHelper.post.resetBehavior();
    requestHelper.post
      .withArgs(fixtures.FX_ROUTE_1, fixtures.FX_LOGIN_PAYLOAD)
      .usingPromise(Promise)
      .resolves(fixtures.FX_LOGIN_RESULT_2);
    requestHelper.get.resetBehavior();
    requestHelper.get.usingPromise(Promise).resolves(fixtures.FX_TOKEN_RESULT_2);

    await auth.login();

    expect(routeHelper.interpolate.called).to.equal(true);
    expect(auth.authSST).to.equal(fixtures.FX_AUTH_SST_2);
    expect(auth.authTT).to.equal(fixtures.FX_AUTH_TT_2);

  });
});
