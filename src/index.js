const express = require('express');
const http = require('http');
const socketio = require('socket.io')
const path = require('path');
const bodyParser = require('body-parser');
const debug = require('debug')('soundcloud-rp:server');
const cors = require('cors');

const config = require('../config/default.json');

if (config.soundcloud.ClientID == '{insert soundcloud client_id}')
  throw new Error('Please edit the default soundcloud client_id before starting the server');

const rpc = require('./rpc')(config);


const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

const client_routes = require('./routes/client');

app.use(client_routes);

const client_protocol = require('./protocols/client')(config, io, rpc);

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


module.exports = server;