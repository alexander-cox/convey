const convey = require("./convey");

const app = convey();

app.listen(8080, () => {
  console.log("convey app listening on 8080");
});
