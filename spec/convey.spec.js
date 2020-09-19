const supertest = require('supertest');
const http = require('http');
const { expect } = require('chai');
const sinon = require('sinon');
const convey = require('../convey');
let app;

function tryToCloseServer(done) {
  try {
    app.__server.close(done);
  } catch (err) {
    done();
  }
}

describe('convey', () => {
  beforeEach(() => {
    app = convey();
  });

  describe('convey properties', () => {
    it('should have a server property set to an instance of http server', (done) => {
      expect(app).to.be.an.instanceOf(http.Server);
      done();
    });
  });
  describe('listen method', () => {
    afterEach(tryToCloseServer);
    it('should accept a port and a callback, and call that callback', (done) => {
      const spy = sinon.spy();
      const result = app.listen(9000, spy);
      //this is a cheeky way to overcome an async issue, the immediate queue will be called after the i/o callback queue
      setImmediate(() => {
        expect(spy.calledOnce).to.be.true;
        done();
      });
    });
  });
});
