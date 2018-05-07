const router = require('express').Router();
const trace = require('debug')('soundcloud-rp:trace');

module.exports = (config, rpc) => {

  router.get('/', (req, res) => {
    trace('GET overview');

    let current_activity = rpc.getActivity();

    res.json({
      status: rpc.status,
      now_playing: current_activity == false ? null : current_activity.trackURL
    });
  });

  return router;
};