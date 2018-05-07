const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const debug = require('debug')('soundcloud-rp:server');
const cors = require('cors');

const config = require('../config/default.json');

if (config.soundcloud.ClientID == '{insert soundcloud client_id}')
  throw new Error('Please edit the default soundcloud client_id before starting the server');

const rpc = require('./rpc')(config);

const overview = require('./routes/overview')(config, rpc);
const activity = require('./routes/activity')(config, rpc);

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(overview);
app.use(activity);

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  let data = {
    code: err.status || err.statusCode || 500,
    error: err.name,
    message: err.message
  };

  if (req.app.get('env') !== 'production') {
    data.debug = err;
    data.stack = err.stack;
  }

  // render the error page
  debug(`${err.stack}`);
  res.status(data.code);
  res.json(data);
});


module.exports = app;