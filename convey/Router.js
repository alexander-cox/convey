class Router {
  constructor() {
    this.__middlewareQueue = [];
  }
  __queueMiddleware(path, method, middleware) {
    const { __middlewareQueue } = this;
    __middlewareQueue.push({ path, method, func: middleware });
  }
  use(middleware) {
    this.__queueMiddleware(null, null, middleware);
  }
  get(path, middleware) {
    this.__queueMiddleware(path, 'GET', middleware);
  }
  post(path, middleware) {
    this.__queueMiddleware(path, 'POST', middleware);
  }
  patch(path, middleware) {
    this.__queueMiddleware(path, 'PATCH', middleware);
  }
  put(path, middleware) {
    this.__queueMiddleware(path, 'PUT', middleware);
  }
  delete(path, middleware) {
    this.__queueMiddleware(path, 'DELETE', middleware);
  }
}

module.exports = function() {
  return new Router();
};
