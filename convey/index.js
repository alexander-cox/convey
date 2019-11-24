const http = require("http");

class Convey {
  constructor(cb) {
    this.__server = http.createServer(function requestHandler(
      request,
      response
    ) {});
  }
  listen(PORT, callback) {
    this.__server.listen(PORT, callback);
  }
}

function convey() {
  return new Convey();
}

module.exports = convey;
