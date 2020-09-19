const http = require('http');

function createServer() {
  const server = http.createServer();
  server.__middlewareQueue = [];
  server.__middlewareIndex = 0;
  server.__next = function (req, res) {
    const index = this.__middlewareIndex++;
    const next = () => {
      this.__next(req, res);
    };
    const { func: middleware, method } = this.__middlewareQueue[index];
    if (method === req.method || method === 'USE') {
      middleware(req, res, next);
    } else this.__next(req, res);
  };

  const methods = ['get', 'post', 'patch', 'put', 'delete', 'use'];

  methods.forEach((method) => {
    server[method] = function (path, middleware) {
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
