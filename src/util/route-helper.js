const querystring = require('querystring');

class RouteHelper {
  interpolate(template, params, query) {
    let queryStr = '';
    if (query) queryStr = `?${ querystring.stringify(query) }`;
    return template.split('/').map(view => (view[0] === ':' ? params[view.substr(1)] : view)).join('/') + queryStr;
  }

  // parse(route, template) {
  //   let parsedRoute = '';
  //   if (route.startsWith('http')) {
  //     const routeMatch = route.match(/^(https?:)\/\/(([^:/?#]*)(?::([0-9]+))?)([/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
  //     parsedRoute = routeMatch ? routeMatch[5] : '';
  //   } else {
  //     parsedRoute = route;
  //   }
  //
  //   const values = parsedRoute.split('/');
  //   const views = template.split('/');
  //
  //   return views.reduce((result, view, idx) => {
  //     if (view[0] === ':') {
  //       return {
  //         ...result,
  //         [view.substr(1)]: values[idx]
  //       };
  //     }
  //     return result;
  //   }, {});
  // };
}

module.exports = RouteHelper;
