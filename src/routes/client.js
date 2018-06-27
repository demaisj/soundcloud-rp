const router = require('express').Router();
const trace = require('debug')('soundcloud-rp:trace');

router.get('/client.js', (req, res) => {
  trace('GET client');

  res.set('content-type', 'application/javascript');
  res.render('client', {
    host: req.get('host')
  });
});

module.exports = router;