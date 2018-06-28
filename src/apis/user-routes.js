module.exports = {
  CREATE_USER: '/gdc/account/domains/:domain/users',
  ADD_USER_TO_PROJECT: '/gdc/projects/:projectId/users',
  DELETE_USER: '/gdc/account/profile/:userId',
  GET_USER_INFO_BY_LOGIN: '/gdc/account/domains/:domain/users',
  GET_USER_DATA_PERMISSIONS: '/gdc/md/:projectId/userfilters',
  UPDATE_FILTERS: '/gdc/md/:projectId/userfilters'
};
