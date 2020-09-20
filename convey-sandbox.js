const convey = require('./convey');

const app = convey();

// app.use(convey.bodyParser);

app.get('/hello', (req, res, next) => {
  res.status(200).send('well hello there!!!!');
  next();
});

app.get('/hello', (req, res) => {
  console.log('moreeeee');
});

app.post('/hello', function (req, res) {
  const body = req.body;
  const stringyBody = JSON.stringify({ body });
  res.send(stringyBody);
});

app.patch('/cookie', (req, res, next) => {
  const cookie = req.body;
  res.send({ cookie });
});

const PORT = 9090;

app.listen(PORT, () => {
  console.log(`convey app listening on ${PORT}`);
});
