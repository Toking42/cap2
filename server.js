// codecademy Project Cap2
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const errorhandler = require('errorhandler');

const bodyParser = require('body-parser');
const apiRouter = require('./api/api');

const DEBUG = true;

const PORT = process.env.PORT || 4000;

const app = express();

app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(cors());

app.use('/api', apiRouter);

app.use(errorhandler());

// INIT server
app.listen(PORT, ()=> {
  console.log('Server listening on PORT '+PORT);
})

module.exports = app;
