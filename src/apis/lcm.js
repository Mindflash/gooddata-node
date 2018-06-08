const routes = require('./lcm-routes');

class LCM {

  constructor(requestHelper, routeHelper) {
    this.requestHelper = requestHelper;
    this.routeHelper = routeHelper;
  }

  getClient(params) {
    const path = this.routeHelper.interpolate(routes.GET_CLIENT, {
        domainId: params.domainId,
        dataProductId: params.dataProductId,
        clientId: params.clientId
      }, {
        user: params.user ? 'user' : null
      });
    return this.requestHelper.get(path);
  }
}

module.exports = LCM;
