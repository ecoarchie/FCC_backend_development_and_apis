// index.js
// where your node app starts

// init project
var express = require("express");
require("dotenv").config();
var app = express();
let bodyParser = require("body-parser");

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require("cors");
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static(__dirname + "/public"));
app.use(function (req, res, next) {
  console.log(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

app.use(bodyParser.urlencoded({ extended: false }));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

// if date param is empty
app.get("/api", (req, res) => {
  const unix = Date.now();
  const utc = new Date(unix).toUTCString();
  const resObj = { unix: unix, utc: utc };
  res.json(resObj);
});

// parse 'yyyy-mm-dd' style route
app.get("/api/:date", (req, res) => {
  const date = req.params.date;
  let unix;
  let utc;
  if (isNaN(Number(date))) {
    unix = Date.parse(date);
  } else {
    unix = Number(date);
  }
  utc = new Date(unix).toUTCString();
  let resObj;
  if (!unix) {
    resObj = { error: utc };
  } else {
    resObj = { unix: unix, utc: utc };
  }
  res.send(resObj);
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
