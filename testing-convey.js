const convey = require("./convey");

const app = convey();

app.use((req, res) => {
  res.send("booo!");
});

app.get("/hello", (req, res) => {
  res.send("well hello there!");
});

app.listen(8080, () => {
  console.log("convey app listening on 8080");
});
