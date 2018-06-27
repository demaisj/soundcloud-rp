// ==UserScript==
// @name         Soundcloud Rich Presence
// @namespace    https://github.com/demaisj/soundcloud-rp
// @version      2.0.0
// @description  Adds Discord Rich Presence support to Soundcloud. A server is needed to run in background in order for the system to work.
// @author       demaisj
// @match        https://soundcloud.com/*
// @grant        none
// ==/UserScript==

(function(){
  function load_script() {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.id = 'soundcloud-rp-client';
    var match = document.getElementById(script.id);
    if (match)
      match.remove();
    script.type = 'text/javascript';
    script.src = 'http://127.0.0.1:7769/client.js';
    script.onerror = function(){
      setTimeout(load_script, 10 * 1000);
    };
    head.appendChild(script);
  }
  load_script();
})();