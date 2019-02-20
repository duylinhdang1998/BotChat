require("dotenv").config();
const express = require("express");
const request = require("request");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 1137;
const router = require('./router/index');

app.use(bodyParser.json());
app.use('/', router);
app.listen(PORT, () => {
  console.log("Sever listening  " + PORT);
});
