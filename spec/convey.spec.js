const supertest = require("supertest");
const http = require("http");
const { expect } = require("chai");
const sinon = require("sinon");
const convey = require("../convey");
let app;

function tryToCloseServer(done) {
  try {
    app.__server.close(done);
  } catch (err) {
    done();
  }
}

describe("convey", () => {
  beforeEach(() => {
    app = convey();
  });

  describe("convey properties", () => {
    it("should have a server property set to an instance of http server", done => {
      expect(app.__server).to.be.an.instanceOf(http.Server);
      done();
    });
  });
  describe("listen method", () => {
    afterEach(tryToCloseServer);
    it("should accept a port and a callback, and call that callback", done => {
      const spy = sinon.spy();
      const result = app.listen(9000, spy);
      console.log(result);
      //this is a cheeky way to overcome an async issue, the immediate queue will be called after the i/o callback queue
      setImmediate(() => {
        expect(spy.calledOnce).to.be.true;
        done();
      });
    });
  });
  describe("use method", () => {
    it("should have a use method which should accept a callback which is invoked on recieving any request type", done => {
      const spy = sinon.spy(function(req, res) {
        console.log(res);
        res.send();
      });
      app.use(spy);
      app.listen(9000, () => console.log("yoyoyo"));
      const request = supertest("http://localhost:9000");
      const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
      // let calledCount = 0;
      return request.get("/", err => {
        console.log(err);
        expect(spy.callCount).to.be.true;
        done();
      });
      // .then(res => {
      //   ;
      // });
      // return Promise.all(httpMethods.map(method => {
      //   return request[method];
      // })].then(() => {

      // })
      // setImmediate(() => {
      //   expect(spy.callCount).to.be.true;
      //   done();
      // });
    });
  });
});
