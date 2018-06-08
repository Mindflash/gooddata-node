const { expect } = require('chai');
const { describe, it } = require('mocha');
const RouteHelper = require('../../src/util/route-helper');


describe('route helper', () => {
  describe('interpolate method', () => {
    it('populates route with variables and query correctly', async () => {
      const routeHelper = new RouteHelper();
      const template = '/some/:var1/route/:var2/doit';
      const url = routeHelper.interpolate(template, {
        var1: 'test',
        var2: 1234
      }, {
        q: 1234,
        z: 'hello'
      });

      expect(url).to.equal('/some/test/route/1234/doit?q=1234&z=hello');
    });

    it('correctly encodes query string', async () => {
      const routeHelper = new RouteHelper();
      const template = '/some/:var1/route/:var2/doit';
      const url = routeHelper.interpolate(template, {
        var1: 'test',
        var2: 1234
      }, {
        q: 'this is%a+test'
      });

      expect(url).to.equal('/some/test/route/1234/doit?q=this%20is%25a%2Btest');
    });
  });

  describe('parse method', () => {
    it('parses route path parts out correctly', async () => {
      const routeHelper = new RouteHelper();
      const template = '/some/:var1/route/:var2/doit';
      const url = '/some/test/route/1234/doit';
      expect(routeHelper.parse(url, template)).to.deep.equal({
        var1: 'test',
        var2: '1234'
      });
    });

    it('parses full url route parts out correctly', async () => {
      const routeHelper = new RouteHelper();
      const template = '/some/:var1/route/:var2/doit';
      const url = 'http://hostname/some/test/route/1234/doit';
      expect(routeHelper.parse(url, template)).to.deep.equal({
        var1: 'test',
        var2: '1234'
      });
    });
  });
});
