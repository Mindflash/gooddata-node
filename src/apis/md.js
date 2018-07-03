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

  lookupIdentifierUri({ projectId, identifiers }) {
    if (identifiers && !Array.isArray(identifiers)) identifiers = [ identifiers ];
    const path = this.routeHelper.interpolate(routes.LOOKUP_IDENTIFIER_URI, {
      projectId
    });

    return this.requestHelper.post(path, {
      body: {
        identifierToUri: identifiers
      }
    });
  }

  lookupLabelUri({ projectId, elementLabelPatterns, order, offset, limit }) {
    if (elementLabelPatterns && !Array.isArray(elementLabelPatterns)) elementLabelPatterns = [ elementLabelPatterns ];
    const elementLabelToUri = elementLabelPatterns.map(label => {
      return {
        mode: label.mode || 'EXACT',
        labelUri: label.labelUri,
        patterns: label.patterns
      };
    });

    const path = this.routeHelper.interpolate(routes.LOOKUP_LABEL_URI, {
      projectId
    }, {
      order, offset, limit
    });

    return this.requestHelper.post(path, {
      body : {
        elementLabelToUri
      }
    });
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
