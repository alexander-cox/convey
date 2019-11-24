My own implementation of express

- app - calling convey should return an instance of the convey server application
- get/post/put/patch - should be able to be called on app to add middleware functions to the app when received respective http requests
  req and res should be accepted as arguments to the middlewares
- middlewares should be callable depending on the path argument recieved
- middlewares should be queue-able
- use - add middlware
