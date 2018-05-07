<img src="assets/default.png?raw=true" width="128" height="128" align="left">
<h1>Soundcloud Rich Presence</h1>
Adds Discord Rich Presence support to Soundcloud.
<br><br>

## Introduction

Soundcloud Rich Presence of a server, communicating with discord itself, and a user-script, running on your browser to send playback information to the server.

Sadly, due to restrictions in the rich presence protocol, it is mandatory to run both the server and the user-script in order for the system to work.

Artwork upload is not available by default due to Discord's asset limit (150). In order to activate it, you need to create a new app on the developer interface, and set the new ClientID and your APIKey of the developer interface. More details at **[Artwork Upload](#artwork-upload)**.

## Preview

### With artwork upload

| Profile | Popup |
| ------ | ----- |
| ![](doc/preview-artwork-profile.png?raw=true) | ![](doc/preview-artwork-popup.png?raw=true) |

### Without artwork upload

| Profile | Popup |
| ------ | ----- |
| ![](doc/preview-no-artwork-profile.png?raw=true) | ![](doc/preview-no-artwork-popup.png?raw=true) |

## Installation

*not tested on windows yet*

**Server:**
1. Clone the repository somewhere on your hard drive 

   `git clone https://github.com/demaisj/soundcloud-rp.git`
2. Install the dependencies `npm install`
3. Start the server `npm run start`
4. Additionnaly create a systemd service to start the server on bootup

**Browser:**
1. Install a userscript extension for your browser like [Tampermonkey](https://tampermonkey.net/)
2. Download & install [`soundcloud-rp.user.js`](soundcloud-rp.user.js?raw=true)
3. Open soundcloud & enjoy

## Artwork upload

Coming-soon
