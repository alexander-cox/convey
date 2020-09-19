const http = require('http');

function createServer() {
  const server = http.createServer();
  server.__middlewareQueue = [];

  const methods = ['get', 'post', 'patch', 'put', 'delete'];
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
    const middleware = this.__middlewareQueue[0].func;
    middleware(req, res);
  });
  return server;
}

module.exports = createServer;
