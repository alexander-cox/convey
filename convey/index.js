const http = require('http');

class Convey {
  constructor() {
    this.__middlewareIndex = 0;
    this.__request;
    this.__response;
    //__initialQueue contains starting middleware functions before paths are provided by the user
    this.__intialQueue = [];
    //__pathQueues contain middleware functions provided by user under { '/path': { ['METHOD']: [middFunc1, middFunc2] } }
    this.__pathQueues = {};
    this.__middlewareQueue = [];
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
      this.__response.send = (data) => {
        this.__response.write(data);
        this.__response.end();
        this.__responseSent = true;
        return this.__response;
      };
      this.__response.status = (statusCode) => {
        // console.log(this);
        this.__response.statusCode = statusCode;
        return this.__response;
      };
      this.__request.path = request.url;
      this.__nextMiddlewareHandler();
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
    const { path: reqPath, method: reqMethod } = this.__request;
    const middlewareIndex = this.__middlewareIndex++;
    const middlewareCount = this.__middlewareQueue.length;
    if (middlewareIndex >= middlewareCount) return this.__noPathFound();
    const {
      path: middlewarePath,
      method: middelwareMethod,
      func: middlewareFunc
    } = this.__middlewareQueue[middlewareIndex];
    const req = this.__request;
    const res = this.__response;
    const next = this.__nextMiddlewareHandler.bind(this);
    if (middlewarePath === null) middlewareFunc(req, res, next);
    else if (middlewarePath === reqPath && middelwareMethod === reqMethod) {
      middlewareFunc(req, res, next);
    } else if (middlewareFunc) {
      this.__nextMiddlewareHandler();
    }
  }
  __queueHttpMethodMiddleware(path, method, middleware) {
    const { __middlewareQueue } = this;
    __middlewareQueue.push({ path, method, func: middleware });
  }
  use(middleware) {
    this.__queueHttpMethodMiddleware(null, null, middleware);
  }
  get(path, middleware) {
    this.__queueHttpMethodMiddleware(path, 'GET', middleware);
  }
  post(path, middleware) {
    this.__queueHttpMethodMiddleware(path, 'POST', middleware);
  }
  patch(path, middleware) {
    this.__queueHttpMethodMiddleware(path, 'PATCH', middleware);
  }
  put(path, middleware) {
    this.__queueHttpMethodMiddleware(path, 'PUT', middleware);
  }
  delete(path, middleware) {
    this.__queueHttpMethodMiddleware(path, 'DELETE', middleware);
  }
}

function convey() {
  return new Convey();
}

convey.bodyParser = function bodyParser(request, response, next) {
  let bodyData = '';
  request.on('data', (chunk) => {
    bodyData += chunk.toString();
  });
  request.on('end', () => {
    request.body = JSON.parse(bodyData);
    next();
  });
};

module.exports = convey;
