const trace = require('debug')('soundcloud-rp:trace');
const debug = require('debug')('soundcloud-rp:activity');
const { MAX_ARTWORK, ARTWORK_TRACK, ARTWORK_ARTIST } = require('../helpers/artwork');
const image = require('../helpers/image');

const WAIT_BEFORE_CLEAR = 15;

module.exports = (config, rpc) => {

  const soundcloud = require('../helpers/soundcloud')(config);
  const discord = require('../helpers/discord')(config);

  function processArtwork(type, id, url) {
    trace('activity.processArtwork', type, id, url);

    return new Promise((resolve, reject) => {
      const key = `${type == ARTWORK_TRACK ? 'track' : 'artist'}_${id}`;

      debug("Generated key for artwork:", key);

      if (!config.uploadArtwork) {
        debug("Uploading artworks is not supported, falling back to default");

        if (config.discord.ClientID == '443074120758853643') {
          if (type == ARTWORK_TRACK)
            return resolve(`default_large_${id % 11}`);
          else if (type == ARTWORK_ARTIST)
            return resolve('default_small');
        }
        return resolve('default');
      }

      debug("Checking if artwork is already uploaded...");
      discord.getAssetList()
      .then((assets) => {

        for (let i = 0; i < assets.length; i++) {
          if (assets[i].name == key) {
            debug("Artwork already uploaded, no action needed.");
            return resolve(key);
          }
        }

        debug("Artwork not already uploaded.");

        function continueUpload() {
          let image_processor;

          if (url == null || url.startsWith('http://a1.sndcdn.com/images/default_avatar_large.png')) {
            debug("Artwork is placeholder, getting datauri from stock ones...");
            image_processor = image.imageDataFromFile(`assets/placeholder-${id % 11}.png`);
          }
          else {
            debug("Getting artwork datauri from soundcloud cdn...");
            image_processor = image.imageDataFromUrl(soundcloud.sanitizeArtworkUrl(url));
          }

          image_processor
          .then((data) => {
            debug("Uploading artwork to discord...");
            discord.uploadAsset(type, key, data)
            .then(() => {
              debug("Artwork processed successfully!");
              resolve(key);
            })
            .catch(reject)
          })
          .catch(reject)
        }

        if (assets.length >= MAX_ARTWORK) {
          debug("Asset limit reached, deleting old unused assets...");
          discord.deleteAsset(assets[0].id)
          .then(continueUpload)
          .catch(reject);
        } else {
          continueUpload();
        }

      })
      .catch(reject)
    });
  }

  let LOCKED = false;

  return (request_data) => {
    trace('activity', request_data);

    return new Promise((resolve, reject) => {

    if (!('url' in request_data) || !('pos' in request_data)) {
      debug("Bad Request, missing arguments");
      reject(new Error('Missing url/pos argument.'));
      return;
    }

    if (!rpc.status) {
      debug("Service Unavailable, rpc not connected");
      reject(new Error('RPC not connected to Discord.'));
      return;
    }

    if (LOCKED) {
      debug("LOCKED state, we are already updating activity");
      reject(new Error('An activity request is already being processed.'));
      return;
    }

    function success() {
      LOCKED = false;
      resolve();
    }

    function error(err) {
      LOCKED = false;
      reject(err);
    }

    try{

    LOCKED = true;

    let last_activity = rpc.getActivity();
    if (last_activity && last_activity.trackURL == request_data.url) {
      debug('track info already sent, updating timestamps only...');
      last_activity.startTimestamp = Math.round(new Date().getTime() / 1000) - request_data.pos;
      last_activity.endTimestamp = last_activity.startTimestamp + Math.round(last_activity.trackDuration / 1000);

      rpc.setActivity(last_activity)
      .then(() => {
        rpc.setActivityTimeout(last_activity.endTimestamp + WAIT_BEFORE_CLEAR);

        success();
      })
      .catch(error);
      return;
    }

    debug("getting track info...");
    soundcloud.getTrackData(request_data.url)
    .then((track_data) => {
      debug("Track info downloaded successfully.", track_data.id);

      let startTimestamp = Math.round(new Date().getTime() / 1000) - request_data.pos,
        endTimestamp = startTimestamp + Math.round(track_data.duration / 1000);

      debug("Processing artwork...");
      let keys = [];

      processArtwork(ARTWORK_TRACK, track_data.id, track_data.artwork_url)
      .then((key) => keys.push(key))
      .then(() => processArtwork(ARTWORK_ARTIST, track_data.user.id, track_data.user.avatar_url))
      .then((key) => keys.push(key))
      .then(() => {
        debug('Artwork processed successfully', keys);

        let activity_data = {
          details: track_data.title,
          state: `by ${track_data.user.username}`,
          startTimestamp,
          endTimestamp,
          largeImageKey: keys[0],
          largeImageText: track_data.title,
          smallImageKey: keys[1],
          smallImageText: track_data.user.username,
          trackURL: request_data.url,
          trackDuration: track_data.duration
        };

        debug("Everything ok, updating activity.", activity_data);
        rpc.setActivity(activity_data)
        .then(() => {
          rpc.setActivityTimeout(endTimestamp + WAIT_BEFORE_CLEAR);

          success();
        })
        .catch(error);
      })
      .catch(error);
    })
    .catch(error);

    }
    catch(err) {
      error(err);
    }
  });
  };
};