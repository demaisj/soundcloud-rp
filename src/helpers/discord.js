const request = require('request-promise-native');
const trace = require('debug')('soundcloud-rp:trace');

module.exports = (config) => {

  function getAssetList() {
    trace("discord.getAssetList");

    return request.get(`https://discordapp.com/api/oauth2/applications/${config.discord.ClientID}/assets`, {
      headers: {
        authorization: config.discord.APIKey
      },
      json: true
    });
  }

  function uploadAsset(type, key, data) {
    trace('discord.uploadAsset', type, key);

    return request.post(`https://discordapp.com/api/oauth2/applications/${config.discord.ClientID}/assets`, {
      headers: {
        authorization: config.discord.APIKey
      },
      json: true,
      body: {
        name: key,
        type: type,
        image: data
      }
    })
  }

  function deleteAsset(id) {
    trace('discord.deleteAsset', id);

    return request.delete(`https://discordapp.com/api/oauth2/applications/${config.discord.ClientID}/assets/${id}`, {
      headers: {
        authorization: config.discord.APIKey
      }
    })
  }

  return {
    getAssetList,
    uploadAsset,
    deleteAsset
  };
}