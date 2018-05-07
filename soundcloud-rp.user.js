// ==UserScript==
// @name         Soundcloud Rich Presence
// @namespace    https://github.com/demaisj/soundcloud-rp
// @version      1.0.0
// @description  Adds Discord Rich Presence support to Soundcloud. A server is needed to run in background in order for the system to work.
// @author       demaisj
// @match        https://soundcloud.com/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  var api_url = "http://127.0.0.1:7769/";

  function send_playback_info() {
    var url = "https://soundcloud.com" + document.querySelector(".playbackSoundBadge__titleLink").getAttribute("href"),
      pos = parseInt(document.querySelector(".playbackTimeline__progressWrapper").getAttribute("aria-valuenow"), 10),
      playing = document.querySelector(".playControls__play").classList.contains("playing"),
      payload = JSON.stringify({url, pos});

    // don't request when paused
    if (!playing)
      return;

    var request = new XMLHttpRequest();

    request.addEventListener("load", function() {
      var response = this,
        json = JSON.parse(response.responseText);

      if (json.code != 200) {
        console.error('[scrp] server sent error: ', json);
        return;
      }

      console.log('[scrp] activity updated!');
    });

    request.addEventListener("error", function(){
      console.error('[scrp] Unknown HTTP error');
    });

    request.open("POST", api_url, true);
    request.setRequestHeader("Content-type", "application/json; charset=utf-8");
    request.send(payload);
  }

  setInterval(send_playback_info, 10 * 1000);
})();