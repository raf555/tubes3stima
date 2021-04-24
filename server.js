// server.js
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());
app.use(require("./router.js"));
app.use(express.static("public"));

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
