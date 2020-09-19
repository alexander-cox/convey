const convey = require('../convey');
const { expect } = require('chai');
const sinon = require('sinon');
const request = require('supertest');
const http = require('http');

let app;

describe.only('app methods', () => {
  beforeEach(() => {
    app = convey();
  });
  describe('HTTP', () => {
    it('each middleware in the chain should keep track of the path associated with it in the order they were passed', () => {
      const methods = ['get', 'post', 'put', 'patch', 'delete'];
      methods.forEach((method) => {
        app[method](`/path/${method}`, () => {});
      });
      methods.forEach((method, index) => {
        expect(app.__middlewareQueue[index].path).to.equal(`/path/${method}`);
      });
    });
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
    it('request to the server will invoke the middleware function and pass request and response', () => {
      const spy = sinon.spy((req, res) => {
        res.end();
      });
      app.get('/', spy);
      return request(app)
        .get('/')
        .then(() => {
          const [spyArgOne, spyArgTwo] = spy.args[0];
          expect(spyArgOne).to.be.instanceOf(http.IncomingMessage);
          expect(spyArgTwo).to.be.instanceOf(http.ServerResponse);
          expect(spy.calledOnce).to.be.true;
        });
    });
  });
});
