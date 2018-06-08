const faker = require('faker');

exports.FX_HOSTNAME = faker.internet.domainName();

exports.FX_USERNAME = faker.internet.userName();
exports.FX_PASSWORD = faker.internet.password();

exports.FX_AUTH_SST_1 = faker.lorem.word();
exports.FX_AUTH_SST_2 = faker.lorem.word();
exports.FX_AUTH_TT_1 = faker.lorem.word();
exports.FX_AUTH_TT_2 = faker.lorem.word();

exports.FX_ROUTE_1 = faker.system.directoryPath();
exports.FX_ROUTE_2 = faker.system.directoryPath();

exports.FX_LOGIN_RESULT_1 = {
  userLogin: {
    token: exports.FX_AUTH_SST_1
  }
};

exports.FX_LOGIN_RESULT_2 = {
  userLogin: {
    token: exports.FX_AUTH_SST_2
  }
};

exports.FX_TOKEN_RESULT_1 = {
  userToken: {
    token: exports.FX_AUTH_TT_1
  }
};

exports.FX_TOKEN_RESULT_2 = {
  userToken: {
    token: exports.FX_AUTH_TT_2
  }
};

exports.FX_LOGIN_PAYLOAD = {
  settings: {
    reAuthorizeOnSessionExpire: false,
    noLog: true
  },
  body: {
    postUserLogin: {
      login : exports.FX_USERNAME,
      password: exports.FX_PASSWORD,
      remember: 1,
      verify_level: 2
    }
  }
};
