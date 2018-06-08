class API {

  constructor(services, settings) {
    this.settings = settings;
    this.lcm = services.lcm;
    this.auth = services.auth;
    this.project = services.project;
    this.requestHelper = services.requestHelper;

    // surface login calls for convenience
    this.login = this.auth.login.bind(this.auth);
  }
}

module.exports = API;
