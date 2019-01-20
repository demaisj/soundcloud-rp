const { Client } = require('discord-rpc');
const trace = require('debug')('soundcloud-rp:trace');
const debug = require('debug')('soundcloud-rp:rpc');

const WAIT_BETWEEN_TRIES = 10;
const TIMEOUT = 10;

module.exports = (config) => {

  class RPCWrapper {
    constructor(config, rpc) {
      trace("rpc.constructor");

      this._config = config;
      this._rpc = rpc;

      this.activity_timeout = 0;
      this.current_activity = false;

      this.initRPC();
    }

    initRPC() {
      trace("rpc.init");

      this.status = false;

      this._rpc.on('ready', () => {
        trace("rpc.event.ready");
      });

      this.connect();
    }

    connect() {
      trace("rpc.connect");
      debug("Connecting to discord...");

      this._rpc.login({clientId: this._config.discord.ClientID })
      .then(() => {
        trace("rpc.connect.success");
        debug("Connected to discord!");

        this.status = true;
      })
      .catch((err) => {
        trace("rpc.connect.fail");
        this.status = false;

        debug("Failed to connect to discord", err);
        debug(`Trying again in ${WAIT_BETWEEN_TRIES} seconds...`);
        setTimeout(() => {
          this.connect()
        }, WAIT_BETWEEN_TRIES * 1000);
      });
    }

    setActivity(data) {
      trace("rpc.setActivity", data);

      function pad(str) {
        while (str.length < 2)
          str += " ";
        return str;
      }

      data.details = pad(data.details);
      data.state = pad(data.state);
      data.largeImageText = pad(data.largeImageText);
      data.smallImageText = pad(data.smallImageText);

      this.current_activity = data;

      // We need to timeout ourselves, this method doesn't throw any error
      return new Promise((resolve, reject) => {

        var request_timeout = setTimeout(() => {
          trace("rpc.setActivity.fail");
          this.status = false;
          var err = new Error('RPC timeout.');

          debug("Failed to interact with discord", err);
          debug(`Reconnecting again in ${WAIT_BETWEEN_TRIES} seconds...`);
          setTimeout(() => {
            this.connect()
          }, WAIT_BETWEEN_TRIES * 1000);

          reject(err);
        }, TIMEOUT * 1000);

        this._rpc.setActivity(data).then(() => {
          trace("rpc.setActivity.success");

          clearTimeout(request_timeout);
          resolve();
        });
      });
    }

    getActivity() {
      trace("rpc.getActivity");

      return this.current_activity;
    }

    clearActivity() {
      trace("rpc.clearActivity");

      this.current_activity = false;
      this.clearActivityTimeout();

      // We need to timeout ourselves, this method doesn't throw any error
      return new Promise((resolve, reject) => {

        var request_timeout = setTimeout(() => {
          trace("rpc.clearActivity.fail");
          this.status = false;
          var err = new Error('RPC timeout.');

          debug("Failed to interact with discord", err);
          debug(`Reconnecting again in ${WAIT_BETWEEN_TRIES} seconds...`);
          setTimeout(() => {
            this.connect()
          }, WAIT_BETWEEN_TRIES * 1000);

          reject(err);
        }, TIMEOUT * 1000);

        this._rpc.clearActivity().then(() => {
          trace("rpc.clearActivity.success");

          clearTimeout(request_timeout);
          resolve();
        });
      });
    }

    setActivityTimeout(timestamp) {
      trace("rpc.setActivityTimeout", timestamp);
      let now = Math.round(new Date().getTime() / 1000);

      this.clearActivityTimeout();
      this.activity_timeout = setTimeout(() => {
        trace("rpc.setActivityTimeout.timeout");

        this.clearActivity();
      }, (timestamp - now) * 1000);
    }

    clearActivityTimeout() {
      trace("rpc.clearActivityTimeout");
      clearTimeout(this.activity_timeout);
    }
  }

  const rpc = new Client({transport: 'ipc'});

  return new RPCWrapper(config, rpc);
}