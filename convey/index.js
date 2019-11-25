const http = require("http");

class Convey {
  constructor() {
    this.__server = http.createServer((request, response) => {
      response.send = response.end;
      this.conveyRequestHandler(request, response);
    });
    this.__useFunc;
    this.__getFunc;
  }
  conveyRequestHandler(request, response) {
    if (this.__getFunc && this.__getPath) {
      if (request.url === this.__getPath && request.method === "GET") {
        this.__getFunc(request, response);
      }
    }
    if (this.__useFunc) this.__useFunc(request, response);
  }
  listen(PORT, callback) {
    this.__server.listen(PORT, callback);
  }
  use(handler) {
    this.__useFunc = handler;
  }
  get(path, handler) {
    this.__getPath = path;
    this.__getFunc = handler;
  }
}

function convey() {
  return new Convey();
}

module.exports = convey;
