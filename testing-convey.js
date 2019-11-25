const convey = require("./convey");

const app = convey();

app.use((req, res, next) => {
  console.log("use middleware");
  // res.send("booo!");
  next();
});

app.use(convey.bodyParser);

app.get("/hello", (req, res, next) => {
  res.status(400);
  next();
});

app.get("/hello", (req, res) => {
  res.send("well hello there!");
});

app.post("/hello", function(req, res) {
  const body = req.body;
  const stringyBody = JSON.stringify({ body });
  res.send(stringyBody);
});

app.listen(8080, () => {
  console.log("convey app listening on 8080");
});
