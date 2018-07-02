const RequestHelper = require('./net/request-helper');
const RouteHelper = require('./util/route-helper');
const API = require('./api');
const Auth = require('./apis/auth');
const LCM = require('./apis/lcm');
const MD = require('./apis/md');
const Project = require('./apis/project');
const User = require('./apis/user');

module.exports = {
  create(settings) {
    // some defaults
    settings = Object.assign({
      hostname: 'secure.gooddata.com',
      reAuthorizeOnSessionExpire: true,
      retryOnLimitReached: true,
      retryCount: 3,
      maxRetryDelay: 60,
      timeout: 60
    }, settings);

    const routeHelper = new RouteHelper();
    const requestHelper = new RequestHelper(settings);
    const auth = new Auth(requestHelper, routeHelper);
    const lcm = new LCM(requestHelper, routeHelper);
    const md = new MD(requestHelper, routeHelper);
    const project = new Project(requestHelper, routeHelper, md);
    const user = new User(requestHelper, routeHelper, md);

    // register auth api for automatic re-auth on sess expire
    requestHelper.registerAuthProvider(auth);

    return new API({
      auth,
      lcm,
      md,
      project,
      user,
      requestHelper
    }, settings);
  }
};
