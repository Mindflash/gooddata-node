module.exports = {
  GET_PROJECT_USERS: '/gdc/projects/:projectId/users',
  GET_ATTRIBUTE_BY_URI: ':uri',
  CREATE_DATA_PERMISSION: '/gdc/md/:projectId/obj',
  DELETE_DATA_PERMISSION: '/gdc/md/:projectId/obj/:dataPermissionId',
  IDENTIFIER_TO_URI: '/gdc/md/:projectId/identifiers',
  OBTAIN_URI_FOR_ATTRIBUTE_VALUE: '/gdc/md/:projectId/labels'
};
