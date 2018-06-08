const routes = require('./project-routes');

class Project {

  constructor(requestHelper, routeHelper) {
    this.requestHelper = requestHelper;
    this.routeHelper = routeHelper;
  }

  getProjectUsers(params) {
    const path = this.routeHelper.interpolate(routes.GET_PROJECT_USERS, {
        projectId: params.projectId
      }, {
        offset: params.offset,
        limit: params.limit
      });
    return this.requestHelper.get(path);
  }
}

module.exports = Project;
