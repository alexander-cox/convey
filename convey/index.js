const http = require("http");

class Convey {
  constructor() {
    this.__middlewareIndex = 0;
    this.__request;
    this.__response;
    this.__pathQueues = {};
    this.__intialQueue = [];
    this.__server = http.createServer((request, response) => {
      this.__request = request;
      this.__response = response;

      //some parsing of the req/res as it comes in...
      this.__response.send = function(data) {
        response.write(data);
        response.end();
      };
      this.__request.path = request.url;
      this.__conveyRequestHandler();
    });
  }

  listen(PORT, callback) {
    return this.__server.listen(PORT, callback);
  }
  __nextMiddlewareHandler() {
    const { path, method } = this.__request;
    const middleware = this.__pathQueues[path][method][this.__middlewareIndex];
    if (middleware) {
      middleware(this.__request, this.__response, this.__next.bind(this));
    }
  }
  __next() {
    this.__middlewareIndex++;
    this.__nextMiddlewareHandler();
  }
  __conveyRequestHandler() {
    //start the counter at 0 when a new request comes in
    this.__middlewareIndex = 0;
    this.__nextMiddlewareHandler();
  }
  __queueHttpMethodMiddleware(path, method, middleware) {
    const { __pathQueues, __intialQueue } = this;
    if (!__pathQueues[path]) {
      __pathQueues[path] = { [method]: [].concat(__intialQueue) };
    }
    if (!__pathQueues[path][method]) {
      __pathQueues[path][method] = [].concat(__intialQueue);
    }
    __pathQueues[path][method].push(middleware);
  }
  use(middleware) {
    const { __intialQueue, __pathQueues } = this;
    const hasPathQueues = Object.keys(__pathQueues).length > 0;
    if (!hasPathQueues) __intialQueue.push(middleware);
    else {
      for (path in __pathQueues) {
        for (method in __pathQueues[path]) {
          __pathQueues[path][method].push(middleware);
        }
      }
    }
  }
  get(path, middleware) {
    this.__queueHttpMethodMiddleware(path, "GET", middleware);
  }
  post(path, middleware) {
    this.__queueHttpMethodMiddleware(path, "POST", middleware);
  }
  patch(path, middleware) {
    this.__queueHttpMethodMiddleware(path, "PATCH", middleware);
  }
  put(path, middleware) {
    this.__queueHttpMethodMiddleware(path, "PUT", middleware);
  }
}

function convey() {
  return new Convey();
}

convey.bodyParser = function bodyParser(request, response, next) {
  let bodyData = "";
  request.on("data", chunk => {
    bodyData += chunk.toString();
  });
  request.on("end", () => {
    request.body = JSON.parse(bodyData);
    next();
  });
};

module.exports = convey;
