const http = require('http');

function createServer() {
  const server = http.createServer();
  server.__middlewareQueue = [];
  server.__middlewareIndex = 0;
  server.__next = function (req, res) {
    const index = this.__middlewareIndex++;
    const next = () => this.__next(req, res);
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
          res.statusCode = 500;
          res.end('Internal Server Error');
        }
      } else this.__next(req, res);
    }
  };

  const methods = ['get', 'post', 'patch', 'put', 'delete', 'use'];

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

  server.on('request', function (req, res) {
    this.__middlewareIndex = 0;
    this.__next(req, res);
  });
  return server;
}

module.exports = createServer;
