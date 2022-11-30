require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
let bodyParser = require('body-parser');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

let urlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true,
  },
  short_url: {
    type: Number,
    required: true,
  },
});

let Url = mongoose.model('Url', urlSchema);

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', [
  async function (req, res, next) {
    // validate url
    dns.lookup(new URL(req.body.url).host, function (err, address, family) {
      if (err) {
        res.json({ error: 'invalid url' });
        return;
      }
      next(err);
    });
  },
  async function (req, res) {
    const regex = /^https?:\/\/[\w\W]+/;

    console.log(req.body.url);
    const urlMatched = req.body.url.match(regex)[0];
    const urlToFind = await Url.findOne({
      original_url: urlMatched,
    });
    if (!urlToFind) {
      let lastAddedUrl = await Url.find().sort({ short_url: -1 }).limit(1);
      let lastIndex = lastAddedUrl[0] ? lastAddedUrl[0].short_url : 0;
      const newUrl = await Url.create({
        original_url: urlMatched,
        short_url: lastIndex + 1,
      });
      res.json({ original_url: newUrl.original_url, short_url: newUrl.short_url });
    } else {
      res.json({ original_url: urlToFind.original_url, short_url: urlToFind.short_url });
    }
  },
]);

app.get('/api/shorturl/:surl', async function (req, res) {
  const urlObj = await Url.findOne({ short_url: parseInt(req.params.surl) });

  if (!urlObj) {
    res.json({ error: 'No short URL found for the given input' });
  } else {
    res.redirect(302, urlObj.original_url);
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
