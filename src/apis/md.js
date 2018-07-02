const routes = require('./md-routes');

class MD {

  constructor(requestHelper, routeHelper) {
    this.requestHelper = requestHelper;
    this.routeHelper = routeHelper;
  }

  createMetadata({ projectId, body }) {
    const path = this.routeHelper.interpolate(routes.CREATE_METADATA, {
      projectId
    });

    return this.requestHelper.post(path, { body });
  }

  deleteMetadata({ projectId, id }) {
    const path = this.routeHelper.interpolate(routes.DELETE_METADATA, {
      projectId,
      id
    });

    return this.requestHelper.del(path);
  }

  getIdentifiers({ projectId, body }) {
    const path = this.routeHelper.interpolate(routes.GET_IDENTIFIERS, {
      projectId
    });

    return this.requestHelper.post(path, { body });
  }

  getLabels({ projectId, body }) {
    const path = this.routeHelper.interpolate(routes.GET_LABELS, {
      projectId
    });

    return this.requestHelper.post(path, { body });
  }

  getUserFilters(params) {
    const path = this.routeHelper.interpolate(routes.GET_FILTERS, {
      projectId: params.projectId
    }, { users: params.users, offset: params.offset, count: params.count });
    return this.requestHelper.get(path);
  }

  updateFilters({ projectId, body }) {
    const path = this.routeHelper.interpolate(routes.UPDATE_FILTERS, {
      projectId
    });

    return this.requestHelper.post(path, { body });
  }
}

module.exports = MD;
