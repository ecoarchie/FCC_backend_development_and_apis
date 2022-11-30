const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');
const { connectToDb, getDb } = require('./db');
const { ObjectId } = require('mongodb');

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

//connect to MongoDB
let db;
connectToDb((err) => {
  if (!err) {
    const listener = app.listen(process.env.PORT || 3000, () => {
      console.log('Your app is listening on port ' + listener.address().port);
    });
    db = getDb();
  }
});

/*
routes
POST  /api/users  creates new user. Send {"username": "john_doe"}, response {"username": "john_doe", "_id": "1234556"}
GET   /api/users  get list of all users. Returns an array with objects like {"username": "john_doe", "_id": "1234556"}
POST  /api/users/:_id/exercises   with form data description, duration, and optionally date. If no date is supplied, the current date will be used.
The response returned from POST /api/users/:_id/exercises will be the user object with the exercise fields added.

*/

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Insert user
// @route   POST  /api/users
app.post('/api/users', async (req, res) => {
  await db.collection('users').insertOne(req.body);
  const foundUserArr = await db
    .collection('users')
    .find({ username: req.body.username })
    .toArray();
  res.json(foundUserArr[0]);
});

// Get all users
// @route   GET /api/users
app.get('/api/users', async (req, res, next) => {
  const allUsers = await db.collection('users').find().toArray();
  if (!allUsers) {
    next();
  }
  res.json(allUsers);
});

// Insert user's exercise
// @route   POST  /api/users/:_id/exercises
app.post('/api/users/:_id/exercises', async (req, res, next) => {
  const filter = { _id: req.params._id };
  // check if user exists
  let user;
  if (ObjectId.isValid(req.params._id)) {
    user = await db.collection('users').findOne({ _id: ObjectId(req.params._id) });
  }
  if (!user) {
    return next(new Error('Insert correct User ID'));
  }
  const date = req.body.date
    ? new Date(req.body.date).toDateString()
    : new Date(Date.now()).toDateString();

  // insert exercise
  await db.collection('exercises').insertOne({
    user: user._id,
    description: req.body.description,
    duration: req.body.duration,
    date: date,
  });

  const resObj = {
    usename: user.username,
    description: req.body.description,
    duration: req.body.duration,
    date: date,
    _id: user._id,
  };
  res.json(resObj);
});

// Get logs of a certain user
app.get('/api/users/:_id/logs', async (req, res) => {
  // get user
  let user;
  if (ObjectId.isValid(req.params._id)) {
    user = await db.collection('users').findOne({ _id: ObjectId(req.params._id) });
  } else {
    res.status(500).json({ err: 'Invalid ID' });
    return;
  }
  if (!user) {
    res.status(500).json({ err: 'Such user doesnt exist' });
    return;
  }

  // get user's exercises
  exercises = await db
    .collection('exercises')
    .find({ user: user._id })
    .project({ _id: 0, description: 1, duration: 1, date: 1 })
    .toArray();
  // console.log(await exercises.length);
  user['log'] = exercises;
  user['count'] = exercises.length;

  res.json(user);
});
