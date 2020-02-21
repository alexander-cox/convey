const convey = require('./convey');
const apiRouter = convey.Router();

apiRouter.get('/apples', (req, res) => {
  console.log('on api Router for /apples');
});

module.exports = apiRouter;
