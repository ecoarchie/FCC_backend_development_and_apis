let express = require("express");
let app = express();

let bodyParser = require("body-parser");

app.use("/public", express.static(__dirname + "/public"));
app.use(function (req, res, next) {
  console.log(`${req.method} ${req.path} - ${req.ip}`);
  next();
});
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/json", function (req, res) {
  const message_style = process.env.MESSAGE_STYLE;
  const obj = { message: "Hello json" };
  if (message_style === "uppercase") {
    obj.message = obj.message.toUpperCase();
  }
  res.json(obj);
});

app.get(
  "/now",
  function (req, res, next) {
    req.time = new Date().toString();
    next();
  },
  function (req, res) {
    res.send({ time: req.time });
  }
);

app.get("/:word/echo", (req, res) => {
  const word = req.params.word;
  res.send({ echo: word });
});

app
  .route("/name")
  .get((req, res) => {
    const first = req.query.first;
    const last = req.query.last;
    res.json({ name: `${first} ${last}` });
  })
  .post((req, res) => {
    const { first: firstname, last: lastname } = req.body;
    res.json({ name: `${firstname} ${lastname}` });
  });
