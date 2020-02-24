module.exports = function() {
  const routeMiddlewareQueue = [];

  let routerMiddlewareIndex = 0;

  const noPathFound = function(req, res) {
    //default, when no path has been set by the user
    const { url, method } = req;
    res.status(404);
    res.send(`Cannot ${method} ${url}`);
  };

  const routeMiddleware = function(...args) {
    routerMiddlewareIndex = 0;
    nextMiddlewareHandler(...args);
  };

  function queueMiddleware(path, method, middleware) {
    try {
      var argType = middleware.toString();
    } catch {
      var argType = middleware;
    }
    if (typeof middleware !== 'function') {
      throw new Error(`Middleware must be a function: instead got ${argType}`);
    } else {
      routeMiddlewareQueue.push({ path, method, func: middleware });
    }
  }

  ['get', 'post', 'put', 'patch', 'delete'].forEach((method) => {
    routeMiddleware[method] = function(path, middleware) {
      queueMiddleware(path, method.toUpperCase(), middleware);
    };
  });

  const nextMiddlewareHandler = function(req, res, next) {
    const { path: reqPath, method: reqMethod } = req;
    const middlewareCount = routeMiddlewareQueue.length;
    if (routerMiddlewareIndex >= middlewareCount) {
      return noPathFound(req, res);
    } else {
      const {
        path: middlewarePath,
        method: middlewareMethod,
        func: middlewareFunc
      } = routeMiddlewareQueue[routerMiddlewareIndex++];
      if (middlewarePath === null) middlewareFunc(req, res, next);
      else if (middlewarePath === reqPath && middlewareMethod === reqMethod) {
        middlewareFunc(req, res, next);
      } else if (middlewareFunc) {
        nextMiddlewareHandler(req, res, next);
      }
    }
  };

  return routeMiddleware;
};
