const faker = require('faker');

exports.FX_HOSTNAME = faker.internet.domainName();
exports.FX_PATH = '/some/path';
exports.FX_URL_HOSTNAME = `https://${exports.FX_HOSTNAME}`;
exports.FX_URL = `${exports.FX_URL_HOSTNAME}/${exports.FX_PATH}`;

exports.FX_GET_REPLY = {
  id: faker.random.number(),
  email: faker.internet.email(),
  first: faker.name.firstName(),
  last: faker.name.lastName()
};

exports.FX_POST_REPLY = {
  success: true
};

exports.FX_ERR_400 = {
  statusCode: 400,
  success: false
};
