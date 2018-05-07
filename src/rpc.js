const { Client } = require('discord-rpc');
const trace = require('debug')('soundcloud-rp:trace');
const debug = require('debug')('soundcloud-rp:rpc');

const WAIT_BETWEEN_TRIES = 30;

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

      this._rpc.on('ready', () => {
        trace("rpc.event.ready");
        debug("Connected to discord!");

        this.status = true;
      });

      this.connect();
    }

    connect() {
      trace("rpc.connect");
      debug("Connecting to discord...");
      this.status = false;

      this._rpc.login(this._config.discord.ClientID).catch((err) => {
        trace("rpc.connect.fail");
        debug("Failed to connect to discord", err);
        debug(`Trying again in ${WAIT_BETWEEN_TRIES} seconds...`);
        setTimeout(this.connect, WAIT_BETWEEN_TRIES * 1000);
      });
    }

    setActivity(data) {
      trace("rpc.setActivity", data);

      this.current_activity = data;
      return this._rpc.setActivity(data);
    }

    getActivity() {
      trace("rpc.getActivity");

      return this.current_activity;
    }

    clearActivity() {
      trace("rpc.clearActivity");

      this.current_activity = false;
      this.clearActivityTimeout();
      return this._rpc.clearActivity();
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