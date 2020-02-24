const convey = require('./convey');

const app = convey();
const apiRouter = convey.Router();

apiRouter.get('/apples', (req, res) => {
  res.status(200).send(`you made it to ${req.url}`);
});

apiRouter.post('/dogs', (req, res) => {
  res.status(201).send(`you made it to ${req.url}`);
});

app.use('/api', apiRouter);

app.listen(3210, () => {
  console.log('convey app listening on 3210');
});
