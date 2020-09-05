const convey = require('../convey');
const { expect } = require('chai');

let app;

beforeEach(() => {
  app = convey();
});

describe.only('HTTP app methods', () => {
  it('http method functions add middleware function to middleware chain', () => {
    const methods = ['get', 'post', 'put', 'patch', 'delete'];
    const methodFuncs = methods.map((method) => {
      const middleware = function () {};
      app[method]('/', middleware);
      return middleware;
    });
    methodFuncs.forEach((middlewareFunc, index) => {
      expect(app.__middlewareQueue[index].func).to.equal(middlewareFunc);
    });
  });
  it('each middleware in the chain should keep track of the method associated with it', () => {
    const methods = ['get', 'post', 'put', 'patch', 'delete'];
    methods.forEach((method) => {
      app[method]('/', () => {});
    });
    app.__middlewareQueue.forEach(({ method: middlewareMethod }, index) => {
      expect(middlewareMethod).to.equal(methods[index].toUpperCase());
    });
  });
  it('each middleware in the chain should keep track of the path associated with it', () => {
    const methods = ['get', 'post', 'put', 'patch', 'delete'];
    methods.forEach((method) => {
      app[method](`/path/${method}`, () => {});
    });
    methods.forEach((method, index) => {
      expect(app.__middlewareQueue[index].path).to.equal(`/path/${method}`);
    });
  });
});
