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

  describe('convey basics', () => {
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
    it('should respond with 500 internal server error if it catches an error within middleware', () => {
      app.use(() => {
        throw new Error();
      });
      return request(app)
        .get('/')
        .expect(500)
        .then((res) => {
          expect(res.text).to.equal('Internal Server Error');
        });
    });
  });
  describe('Error middleware', () => {
    it('should be invoked when an error happens in standard middleware', () => {
      app.use(() => {
        throw new Error('issue');
      });
      app.use((err, req, res, next) => {
        res.statusCode = 200;
        res.end('shh there was no problem');
      });
      return request(app)
        .get('/')
        .expect(200)
        .then((res) => {
          expect(res.text).to.equal('shh there was no problem');
        });
    });
    it('should be invoked when next is invoked with an argument', () => {
      app.use((_, __, next) => {
        next(new Error('middleware issue'));
      });
      app.use((err, _, res, __) => {
        res.statusCode = 400;
        res.end(`ok maybe there is a problem: ${err.message}`);
      });
      return request(app)
        .get('/')
        .expect(400)
        .then((res) => {
          expect(res.text).to.equal(
            'ok maybe there is a problem: middleware issue'
          );
        });
    });
    it('should allow for errors to propogate down a middleware chain', () => {
      app.use((_, __, next) => {
        next(new Error('middleware issue'));
      });
      app.use((_, __, res, next) => {
        next(new Error('there has been an error higher up the chain'));
      });
      app.use((err, _, res, __) => {
        res.statusCode = 400;
        res.end(`ok maybe there is a problem: ${err.message}`);
      });
      return request(app)
        .get('/')
        .expect(400)
        .then((res) => {
          expect(res.text).to.equal(
            'ok maybe there is a problem: there has been an error higher up the chain'
          );
        });
    });
  });
  describe('response object methods', () => {
    describe('res.status()', () => {
      it('status: should set the status of a response', () => {
        app.use((_, res) => {
          res.status(201);
          res.end();
        });
        return request(app).get('/').expect(201);
      });
      it('status: should return the response to allow chaining', () => {
        let output;
        let responseObj;
        app.use((_, res) => {
          responseObj = res;
          output = res.status(201);
          res.end();
        });
        return request(app)
          .get('/')
          .then(() => {
            expect(output).to.be.an.instanceOf(http.ServerResponse);
            expect(output).to.deep.equal(responseObj);
          });
      });
    });
    describe('res.send()', () => {
      it('send: should end the response with 200 status code by default', () => {
        app.use((_, res) => {
          res.send();
        });
        return request(app).get('/').expect(200);
      });
      it('send: should not change the status code if already set', () => {
        app.use((_, res) => {
          res.status(201);
          res.send();
        });
        return request(app).get('/').expect(201);
      });
      it('send: should send text data provided as an argument', () => {
        app.use((_, res) => {
          res.status(201);
          res.send('hello world');
        });
        return request(app)
          .get('/')
          .expect(201)
          .then((res) => {
            expect(res.text).to.equal('hello world');
          });
      });
      it('send: should set content-type header to text/html', () => {
        app.use((_, res) => {
          res.status(201);
          res.send('hello world');
        });
        return request(app)
          .get('/')
          .expect(201)
          .then((res) => {
            expect(res.headers['content-type']).to.equal(
              'text/html; charset=utf-8'
            );
          });
      });
      it('send: should set content-type header to application/json and stringify if info is an object', () => {
        const body = { msg: 'hello world' };
        app.use((_, res) => {
          res.status(201);
          res.send(body);
        });
        return request(app)
          .get('/')
          .expect(201)
          .then((res) => {
            expect(res.headers['content-type']).to.equal(
              'application/json; charset=utf-8'
            );
            expect(res.body).to.deep.equal(body);
          });
      });
    });
  });
  describe('request object properties', () => {
    describe('req.query', () => {
      it('should provide a query object on the req object set to an empty object by default', () => {
        app.use((req, res) => {
          expect(req.query).to.deep.equal({});
          res.send();
        });
        app.use((err, req, res, next) => {
          console.log('TEST: THIS ERR SHOULD NOT SHOW', err);
        });
        return request(app).get('/').expect(200);
      });
      it('should set a single key value pair onto the query object', () => {
        app.use((req, res) => {
          expect(req.query).to.deep.equal({ key: 'value' });
          res.send();
        });
        app.use((err, req, res, next) => {
          console.log('TEST: THIS ERR SHOULD NOT SHOW', err);
        });
        return request(app).get('/test?key=value').expect(200);
      });
      it('should handle multiple key value pairs from the request url', () => {
        app.use((req, res) => {
          expect(req.query).to.deep.equal({
            key: 'value',
            anotherKey: 'anotherValue',
            differentKey: 'differentValue',
          });
          res.send();
        });
        app.use((err, req, res, next) => {
          console.log('TEST: THIS ERR SHOULD NOT SHOW', err);
        });
        return request(app)
          .get(
            '/test?key=value&anotherKey=anotherValue&differentKey=differentValue'
          )
          .expect(200);
      });
    });
  });
});
