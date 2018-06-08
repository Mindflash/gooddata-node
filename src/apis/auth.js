const routes = require('./auth-routes');

class Auth {

  constructor(requestHelper, routeHelper) {
    this.username = null;
    this.password = null;
    this.authSST = null;
    this.authTT = null;
    this.requestHelper = requestHelper;
    this.routeHelper = routeHelper;
  }

  login(username, password) {
    this.username = this.username || username;
    this.password = this.password || password;
    this.authSST = null;
    this.authTT = null;

    return this.requestHelper.post(this.routeHelper.interpolate(routes.LOGIN), {
      settings: {
        reAuthorizeOnSessionExpire: false,
        noLog: true
      },
      body: {
        postUserLogin: {
          login : this.username,
          password: this.password,
          remember: 1,
          verify_level: 2
        }
      }
    }).then(result => {
      // store the SST
      this.authSST = result.userLogin.token;
    }).then(() => this.getToken());
  }

  getToken() {
    this.authTT = null;

    return this.requestHelper.get(this.routeHelper.interpolate(routes.GET_TOKEN), {
      settings: {
        reAuthorizeOnSessionExpire: false
      },
      headers: {
        'X-GDC-AuthSST': this.authSST
      }
    }).then(result => {
      this.authTT = result.userToken.token;
    });
  }
}

module.exports = Auth;
