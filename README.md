My own implementation of express

- [x] app - calling convey should return an instance of the convey server application
- [x] get/post/put/patch - should be able to be called on app to add middleware functions to the app when received respective http requests
- [x] req and res should be accepted as arguments to the middlewares
- [x] middlewares should be queue-able
- [x] use - add middlware
- [x] default not found error sent
- [ ] req/res parser by adding express-style properties/methods
- [ ] parameterised endpoints
- [ ] queries for endpoints
- [ ] error handling middleware can be added
- [ ] Routers

//where there is no middleware function under that path, i.e. user has not provided via app.get/app.post etc...
