const convey = require('./convey');

const app = convey();
app.use((req, res, next) => {
  console.log('use middleware');
  next();
});

app.use(convey.bodyParser);

app.get('/hello', (req, res, next) => {
  res.status(200).send('well hello there!!!!');
  next();
});

app.get('/hello', (req, res) => {
  console.log('moreeeee');
});

app.post('/hello', function(req, res) {
  const body = req.body;
  const stringyBody = JSON.stringify({ body });
  res.send(stringyBody);
});

app.listen(3210, () => {
  console.log('convey app listening on 3210');
});
