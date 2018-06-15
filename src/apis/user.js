const routes = require('./user-routes');

class User {

  constructor(requestHelper, routeHelper) {
    this.requestHelper = requestHelper;
    this.routeHelper = routeHelper;
  }

  createUser(params) {
    const path = this.routeHelper.interpolate(routes.CREATE_USER, {
      domain: params.domain
    });

    return this.requestHelper.post(path, {
      body: {
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
      }
    });
  }

  addUserToProject(params) {
    const path = this.routeHelper.interpolate(routes.ADD_USER_TO_PROJECT, {
      projectId: params.projectId
    });

    return this.requestHelper.post(path, {
      body: {
        user: {
          content: {
            status: params.status || 'ENABLED',
            userRoles: params.userRoles
          },
          links: {
            self: params.userId
          }
        }
      }
    });
  }

  deleteUser(params) {
    const path = this.routeHelper.interpolate(routes.DELETE_USER, {
      userId: params.userId
    });
    return this.requestHelper.del(path);
  }

  getUserInfoByLogin(params) {
    const path = this.routeHelper.interpolate(routes.GET_USER_INFO_BY_LOGIN, {
      domain: params.domain
    }, { login: params.email });
    return this.requestHelper.get(path);
  }
}

module.exports = User;
