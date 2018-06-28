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

  createDataPermission(params) {
    const path = this.routeHelper.interpolate(routes.CREATE_DATA_PERMISSION, {
      projectId: params.projectId
    });

    return this.requestHelper.post(path, {
      body: {
        userFilter: {
          content: {
            expression: params.expression,
            meta: {
              category: params.category,
              title: params.title
            }
          }
        }
      }
    });
  }

  translateIdentifierToUri(params) {
    const path = this.routeHelper.interpolate(routes.IDENTIFIER_TO_URI, {
      projectId: params.projectId
    });

    return this.requestHelper.post(path, {
      body: {
        identifierToUri: params.identifiers
      }
    });
  }

  obtainUriForAttributeValue({ projectId, labelUri, patterns }) {
    const path = this.routeHelper.interpolate(routes.OBTAIN_URI_FOR_ATTRIBUTE_VALUE, {
      projectId
    });

    return this.requestHelper.post(path, {
      body: {
        elementLabelToUri: [
          {
            mode: 'EXACT',
            labelUri,
            patterns
          }
        ]
      }
    });
  }

  getAttributeByUri({ uri }) {
    const path = this.routeHelper.interpolate(routes.GET_ATTRIBUTE_BY_URI, {
      uri
    });
    return this.requestHelper.get(path);
  }
}

module.exports = Project;
