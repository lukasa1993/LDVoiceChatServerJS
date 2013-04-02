/**
 * Created By:
 * User: lukasa
 * Date: 3/22/13
 * Time: 5:40 PM
 */


var channelManager = function LDUserManager() {
    var jsHashMap = require('./LDJSHashMap.js')
        , channelList = jsHashMap()
        , usersChannelsList = jsHashMap();

    return {
        registerUserOnChannel: function (channel, user) {
            var existingChannel = channelManager.getChannelByName(user.name);
            if (existingChannel != channel) {
                channelList.getElement(existingChannel).removeElement(user.name);
            }

            var usersInChannel = channelList.getElement(channel);
            if (!usersInChannel) {
                channelList.addElement(channel, jsHashMap());
                usersInChannel = channelList.getElement(channel);
            }

            usersInChannel.addElement(user.name, user);
            usersChannelsList.addElement(user, channel);
        },

        deRegisterUserOnChannelByName: function (name) {
            var existendChannel = usersChannelsList.getElement(name)
            if (existendChannel) {
                channelList.removeElement(existendChannel);
            }
            usersChannelsList.removeElement(name);
        },

        renameUserInChannel: function (user, currentName) {
            try {
                channelList.getElement(user.channel).changeKeyOfElement(user.name, currentName);
            } catch (e) {
                console.log("KLeoba Moxda ragaca Kuradgeba Miakciee !!!!!");
                console.log(e);
            }
        },

        getChannelByName: function (name) {
            return usersChannelsList.getElement(name);
        },

        getUserByChannelAndName: function (channel, name) {
            var usersInChannel = channelList.getElement(channel);
            if (usersInChannel)
                return usersInChannel.getElement(name);
            return undefined;
        },

        eachUserInChannel: function (channel, callback) {
            try {
                channelList.getElement(channel).eachElement(callback);
            } catch (e) {
                console.log("KLeoba Moxda ragaca Kuradgeba Miakciee !!!!!");
                console.log(e);
            }
        }
    };
}

module.exports = channelManager;