const routes = require('./user-routes');

class User {

  constructor(requestHelper, routeHelper) {
    this.requestHelper = requestHelper;
    this.routeHelper = routeHelper;
  }

  createUser(params) {
    const path = this.routeHelper.interpolate(routes.CREATE_USER, {
      domainId: params.domainId
    }, {
      accountSetting: {
        login: params.login,
        email: params.email,
        password: params.password,
        verifyPassword: params.verifyPassword,
        firstName: params.firstName,
        lastName: params.lastName,
        ssoProvider: params.ssoProvider,
        language: params.language || 'en-US'
      }
    });
    return this.requestHelper.post(path);
  }

  addUserToProject(params) {
    const path = this.routeHelper.interpolate(routes.ADD_USER_TO_PROJECT, {
      projectId: params.projectId
    }, {
      user: {
        content: {
          status: params.status || 'ENABLED',
          userRoles: params.userRoles
        },
        links: {
          self: params.userId
        }
      }
    });
    return this.requestHelper.post(path);
  }

  deleteUser(params) {
    const path = this.routeHelper.interpolate(routes.DELETE_USER, {
      userId: params.userId
    });
    return this.requestHelper.del(path);
  }
}

module.exports = User;
