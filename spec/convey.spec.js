const http = require('http');
const { expect } = require('chai');
const sinon = require('sinon');
const convey = require('../convey');
const request = require('supertest');

describe('convey', () => {
  let app;

  beforeEach(() => {
    app = convey();
  });

  afterEach(() => {
    app.close();
  });

  describe('convey', () => {
    it('should have a server property set to an instance of http server', (done) => {
      expect(app).to.be.an.instanceOf(http.Server);
      done();
    });
  });
  describe('listen method', () => {
    it('should accept a port and a callback, and call that callback', (done) => {
      const spy = sinon.spy();
      app.listen(9000, spy);
      //this is a cheeky way to overcome an async issue, the immediate queue will be called after the i/o callback queue
      setImmediate(() => {
        expect(spy.calledOnce).to.be.true;
        done();
      });
    });
  });
  describe('Default error responses', () => {
    it('should respond with a default 404 error if endpoint is not handled', () => {
      const methods = ['get', 'post', 'put', 'patch', 'delete'];
      const requestPromises = methods.map((method) => {
        return request(app)
          [method](`/${method}/path`)
          .expect(404)
          .then((res) => {
            expect(res.text).to.equal(
              `Cannot ${method.toUpperCase()} /${method}/path`
            );
          });
      });
      return Promise.all(requestPromises);
    });
  });
});
