const routes = require('./project-routes');

class Project {

  constructor(requestHelper, routeHelper, md) {
    this.requestHelper = requestHelper;
    this.routeHelper = routeHelper;
    this.md = md;
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

  createDataPermission({ projectId, expression, category, title }) {
    return this.md.createMetadata({
      projectId,
      body: {
        userFilter: {
          content: { expression },
          meta: { category, title }
        }
      }
    });
  }

  deleteDataPermission({ projectId, dataPermissionId }) {
    return this.md.deleteMetadata({ projectId, id: dataPermissionId });
  }
}

module.exports = Project;
