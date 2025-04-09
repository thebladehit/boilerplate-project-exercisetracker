require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

const users = new Map();
const exercises = new Map();

const generateId = () => (Math.random() + Date.now()).toString();

app.post('/api/users', (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).end({ error: 'User name must be provided' });
  }
  const id = generateId();
  const userObj = {
    username,
    _id: id,
  };
  users.set(id, userObj);
  exercises.set(id, []);
  res.json(userObj);
});

app.get('/api/users', (req, res) => {
  const result = [];
  for (const [_, data] of users) {
    result.push(data);
  }
  res.json(result);
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const _id = req.params._id;
  const userExercises = exercises.get(_id);
  if (!userExercises) {
    res.status(400).json({
      error: 'No user with such id',
    });
  }

  const description = req.body.description;
  const duration = +req.body.duration;
  const date = req.body.date ? new Date(req.body.date) : new Date();
  
  const user = users.get(_id);

  const exerciseObj = {
    description,
    duration,
    date: date.toDateString(),
  };
  userExercises.push(exerciseObj);

  res.json({
    _id,
    username: user.username,
    ...exerciseObj,
  });
});

app.get('/api/users/:_id/logs', (req, res) => {
  const _id = req.params._id;
  const user = users.get(_id);

  const from = req.query.from ? new Date(req.query.from) : new Date(0);
  const to = req.query.to ? new Date(req.query.to) : new Date();
  const limit = req.query.limit || Infinity;

  const userExercises = exercises.get(_id);
  console.log(userExercises);
  const logs = [...userExercises].filter((item) => 
    new Date(item.date) > from && new Date(item.date) < to
  ).slice(0, limit);

  res.json({
    _id,
    username: user.username,
    count: userExercises.length,
    log: logs,
  });
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});