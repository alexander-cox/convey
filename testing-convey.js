const convey = require("./convey");

const app = convey();

// app.use((req, res) => {
//   console.log(res);
//   res.send("booo!");
// });

app.use(convey.bodyParser);

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
