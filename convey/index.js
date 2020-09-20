const http = require('http');

function createServer() {
  const server = http.createServer();
  server.__middlewareQueue = [];
  server.__middlewareIndex = 0;
  server.__errorMiddlewareQueue = [];
  server.__next = function (req, res) {
    res.status = function (code) {
      res.statusCode = code;
      return res;
    };

    res.send = function (info) {
      if (!res.statusCode) res.status(200);
      if (info instanceof Object) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(info));
      } else {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(info);
      }
    };

    const index = this.__middlewareIndex++;
    const next = (e) => {
      if (e) {
        const nextErrorMiddleware = this.__errorMiddlewareQueue.shift();
        nextErrorMiddleware(e, res, res, next);
      } else this.__next(req, res);
    };
    const nextMiddleware = this.__middlewareQueue[index];

    if (!nextMiddleware) {
      res.statusCode = 404;
      res.end(`Cannot ${req.method} ${req.url}`);
    } else {
      const { func, method, path } = nextMiddleware;
      if (
        (method === req.method && path === req.url) ||
        (method === 'USE' && path === req.url) ||
        (method === 'USE' && path === undefined) ||
        (method === req.method && path === undefined)
      ) {
        try {
          func(req, res, next);
        } catch (e) {
          const nextErrorMiddleware = this.__errorMiddlewareQueue.shift();
          if (nextErrorMiddleware) {
            nextErrorMiddleware(e, res, res, next);
          } else {
            res.statusCode = 500;
            res.end('Internal Server Error');
          }
        }
      } else this.__next(req, res);
    }
  };

  const methods = ['get', 'post', 'patch', 'put', 'delete'];

  methods.forEach((method) => {
    server[method] = function (...args) {
      let path;
      let middleware;
      if (args.length === 2) {
        middleware = args[1];
        path = args[0];
      } else {
        middleware = args[0];
      }
      this.__middlewareQueue.push({
        path,
        func: middleware,
        method: method.toUpperCase(),
      });
    };
  });

  server.use = function (...args) {
    let path;
    let middleware;
    if (args.length === 2) {
      middleware = args[1];
      path = args[0];
    } else {
      middleware = args[0];
    }
    if (middleware.length === 4) {
      this.__errorMiddlewareQueue.push(middleware);
    } else {
      this.__middlewareQueue.push({
        path,
        func: middleware,
        method: 'USE',
      });
    }
  };

  server.on('request', function (req, res) {
    this.__middlewareIndex = 0;
    this.__next(req, res);
  });
  return server;
}

module.exports = createServer;
