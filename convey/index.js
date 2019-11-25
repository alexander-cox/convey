const http = require("http");

class Convey {
  constructor() {
    this.__middlewareIndex = 0;
    this.__request;
    this.__response;
    //__initialQueue contains starting middleware functions before paths are provided by the user
    this.__intialQueue = [];
    //__pathQueues contain middleware functions provided by user under { '/path': { ['METHOD']: [middFunc1, middFunc2] } }
    this.__pathQueues = {};
    //__secondaryUseQueue constains middleware functions passed to .use that can be used when there is no path to take
    this.__secondaryUseQueue = [];
    this.responseSent = false;
    this.__server = http.createServer((request, response) => {
      this.__request = request;
      this.__response = response;
      //when a request comes in the middlware queue must start from the beginning at 0
      this.__middlewareIndex = 0;
      //for default pathNotFound response, __responseSent is required to prevent repeat calls
      this.__responseSent = false;
      //some parsing of the req/res as it comes in...
      this.__response.send = data => {
        this.__response.write(data);
        this.__response.end();
        this.__responseSent = true;
      };
      this.__response.status = statusCode => {
        this.__response.statusCode = statusCode;
      };
      this.__request.path = request.url;
      this.__conveyRequestHandler();
    });
  }

  listen(PORT, callback) {
    return this.__server.listen(PORT, callback);
  }
  __noPathFound() {
    //default, when no path has been set by the user
    const { path, method } = this.__request;
    this.__response.status(404);
    this.__response.send(`Cannot ${method} ${path}`);
  }
  __nextMiddlewareHandler() {
    const { path, method } = this.__request;
    try {
      const middleware = this.__pathQueues[path][method][
        this.__middlewareIndex
      ];
      if (middleware) {
        middleware(this.__request, this.__response, this.__next.bind(this));
      }
    } catch (err) {
      //where there is no middleware function under that path, i.e. user has not provided via app.get/app.post etc...
      const middleware = this.__secondaryUseQueue[this.__middlewareIndex];
      if (middleware) {
        middleware(this.__request, this.__response, this.__next.bind(this));
      } else {
        if (!this.__responseSent) this.__noPathFound();
      }
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
    const { __intialQueue, __pathQueues, __secondaryUseQueue } = this;
    __secondaryUseQueue.push(middleware);
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
  delete(path, middleware) {
    this.__queueHttpMethodMiddleware(path, "DELETE", middleware);
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
