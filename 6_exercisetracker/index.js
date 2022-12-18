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
  const result = await db.collection('users').insertOne({ username: req.body.username });
  res.json({ username: req.body.username, _id: result.insertedId.toString() });
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

  const exercise = {
    description: req.body.description,
    duration: parseInt(req.body.duration),
    date: date,
  };
  const exerciseToInsert = {
    user: user._id,
    ...exercise,
  };

  const exerciseToReturn = {
    ...user,
    ...exercise,
  };
  // insert exercise
  const insertRes = await db.collection('exercises').insertOne({ ...exerciseToInsert });

  res.json(exerciseToReturn);
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
  let exercises = await db
    .collection('exercises')
    .find({
      user: user._id,
    })
    .project({ _id: 0, description: 1, duration: 1, date: 1 })
    .toArray();

  if (req.query.from || req.query.to) {
    if (req.query.from) {
      exercises = exercises.filter((e) => new Date(e.date) >= new Date(req.query.from));
      user['from'] = new Date(req.query.from).toDateString();
    }
    if (req.query.to) {
      exercises = exercises.filter((e) => new Date(e.date) <= new Date(req.query.to));
      user['to'] = new Date(req.query.to).toDateString();
    }
  }
  if (req.query.limit) {
    exercises = exercises.slice(0, req.query.limit);
  }
  user['count'] = exercises.length;
  user['log'] = exercises;

  res.send(user);
});
