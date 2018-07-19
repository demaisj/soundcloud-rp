<img src="assets/default.png?raw=true" width="128" height="128" align="left">
<h1>Soundcloud Rich Presence</h1>
Adds Discord Rich Presence support to Soundcloud.
<br><br>

## Introduction

Soundcloud Rich Presence allows you to show off your Soundcloud listening session to your friends using Discord Rich Presence. 

It is a combination of a server, communicating with discord itself, and a user-script, running on your browser to send playback information to the server. Sadly, due to restrictions in the rich presence protocol, it is mandatory to run both the server and the user-script in order for the system to work.

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

You will need to install [nodejs (v10) and npm (v6)](https://nodejs.org/en/download/current/) first. Make sure the `node` & `npm` commands are installed on your **PATH**.

**Server:**
1. Clone the repository somewhere on your hard drive or [unzip this archive](https://github.com/demaisj/soundcloud-rp/archive/master.zip) if you don't have git installed
2. Open a terminal in the **soundcloud-rp** directory
3. Install the dependencies with `npm install`
4. Retrieve your Soundcloud ClientID :
   - Open [Soundcloud](https://soundcloud.com/) then hit Ctrl+Shift+I to open the devtools
   - Go to the **Network** tab
   - Filter by `api-v2.soundcloud.com`
   - Click on the first result. If there is no results, try changing page on Soundcloud to trigger some requests
   - Scroll down to the **Query String Parameters** section
   - Look for the **client_id** field and copy the value
   - Paste it in the corresponding field of the `config/default.json` file
5. Start the server with `npm run start`
6. Additionnaly create a systemd service (linux) or startup shortcut (windows) to start the server on bootup

**Browser:**
1. Install a userscript extension for your browser like [Tampermonkey](https://tampermonkey.net/)
2. Download & install [`soundcloud-rp.user.js`](soundcloud-rp.user.js?raw=true)
3. Open soundcloud & enjoy

## Artwork upload

Here is a step by step guide to activate artwork upload:
1. In the `config/default.json` file, change `uploadArtwork` from `false` to `true`
2. Go to the [developer interface](https://discordapp.com/developers/applications/me) of Discord
3. Create a new app, give it a cool name and save it
4. Paste the Client ID (found in App Details on the top of the page) into the `config/default.json` file
5. Scroll down and click "*Enable Rich Presence*"
6. Hit save changes just in case
7. Retrieve your APIKey
   - Hit ctrl+shift+i to open the devtools
   - Go to application tab
   - Find Local Storage section
   - Copy value inside the double-quotes next to the key `token`
   - Paste it to the `config/default.json` file
8. Restart your server and it should be ok!
