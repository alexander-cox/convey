const convey = require('../convey');
const { expect } = require('chai');
const sinon = require('sinon');
const request = require('supertest');
const http = require('http');

describe('app methods', () => {
  let app;
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
    it('use: should be a method invoked regardless of methods sent', () => {
      const spy = sinon.spy((req, res) => {
        res.end();
      });
      app.use('/', spy);
      const methods = ['get', 'post', 'put', 'patch', 'delete'];
      const requestPromises = methods.map((method) => {
        return request(app)[method]('/');
      });
      return Promise.all(requestPromises).then(() => {
        expect(spy.callCount).to.equal(methods.length);
      });
    });
    it('middleware should be invoked in order provided to convey providing they call the next callback', () => {
      const spyOne = sinon.spy((req, res, next) => {
        next();
      });
      const spyTwo = sinon.spy((req, res, next) => {
        next();
      });
      const spyThree = sinon.spy((req, res) => {
        res.end();
      });
      app.use('/', spyOne);
      app.use('/', spyTwo);
      app.use('/', spyThree);
      return request(app)
        .post('/')
        .then(() => {
          sinon.assert.callOrder(spyOne, spyTwo, spyThree);
        });
    });
    it('middlware chain should skip to the next function in the chain if method is not correct', () => {
      const spy = sinon.spy((_, res) => {
        res.end();
      });
      app.delete('/', spy);
      app.use('/', (_, res) => {
        res.end();
      });
      const incorrectMethods = ['get', 'post', 'put', 'patch'];
      const requestPromises = incorrectMethods.map((method) => {
        return request(app)[method]('/');
      });
      return Promise.all(requestPromises)
        .then(() => {
          expect(spy.callCount).to.equal(0);
          return request(app).delete('/');
        })
        .then(() => {
          expect(spy.callCount).to.equal(1);
        });
    });
    it('should only invoke the middleware when path is matched', () => {
      const spy = sinon.spy((_, res) => {
        res.end();
      });
      app.put('/correct_path', spy);
      app.use('/', (_, res) => {
        res.end();
      });
      return request(app)
        .put('/')
        .then(() => {
          expect(spy.called).to.be.false;
          return request(app).put('/correct_path');
        })
        .then(() => {
          expect(spy.called).to.be.true;
        });
    });
    it('should only invoke use middleware when path is matched', () => {
      const useMiddlewareSpy = sinon.spy((_, __, next) => {
        next();
      });
      app.use('/correct_path', useMiddlewareSpy);
      app.patch('/correct_path', (_, res) => {
        res.end();
      });
      app.use('/', (_, res) => {
        res.end();
      });
      return request(app)
        .patch('/')
        .then(() => {
          expect(useMiddlewareSpy.called).to.be.false;
          return request(app).patch('/correct_path');
        })
        .then(() => {
          expect(useMiddlewareSpy.called).to.be.true;
        });
    });
    it('methods should not require a path to invoke middleware function', () => {
      const methods = ['get', 'post', 'put', 'patch', 'delete'];
      const middlewareSpies = {};
      methods.forEach((method) => {
        const spy = sinon.spy((_, res) => {
          res.end();
        });
        app[method](spy);
        middlewareSpies[method] = spy;
      });
      const requestPromises = methods.map((method) => {
        return request(app)[method]('/a-random-path');
      });
      return Promise.all(requestPromises).then(() => {
        methods.forEach((method) => {
          const middleware = middlewareSpies[method];
          expect(middleware.calledOnce).to.be.true;
        });
      });
    });
  });
});
