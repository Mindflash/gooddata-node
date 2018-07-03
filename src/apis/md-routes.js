module.exports = {
  CREATE_METADATA: '/gdc/md/:projectId/obj',
  DELETE_METADATA: '/gdc/md/:projectId/obj/:id',
  GET_METADATA: '/gdc/md/:projectId/obj/:id',
  LOOKUP_IDENTIFIER_URI: '/gdc/md/:projectId/identifiers',
  LOOKUP_LABEL_URI: '/gdc/md/:projectId/labels',
  GET_FILTERS: '/gdc/md/:projectId/userfilters',
  UPDATE_FILTERS: '/gdc/md/:projectId/userfilters'
};
