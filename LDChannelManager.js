/**
 * Created By:
 * User: lukasa
 * Date: 3/22/13
 * Time: 5:40 PM
 */


var channelManager = function LDChannelManager() {
    var jsHashMap = require('./LDJSHashMap.js')
        , channelList = jsHashMap()
        , usersChannelsList = jsHashMap()
        , userCount = 0;

    return {
        registerUserOnChannel: function (channel, user) {
            var existingChannel = this.getChannelByName(user.name);
            if (existingChannel && existingChannel != channel) {
                this.deRegisterUserOnChannelByName(user);
            }

            var usersInChannel = channelList.getElement(channel);
            if (!usersInChannel) {
                channelList.addElement(channel, jsHashMap());
                usersInChannel = channelList.getElement(channel);
            }

            usersInChannel.addElement(user.name, user);
            usersChannelsList.addElement(user.name, channel);
            userCount++;
        },

        deRegisterUserOnChannelByName: function (user) {
            try {
                channelList.getElement(user.channel).removeElement(user.name);
                usersChannelsList.removeElement(user.name);
                if (channelList.getElement(user.channel).getElementCount() == 0) {
                    channelList.removeElement(user.channel);
                }
                userCount--;
            } catch (e) {
                console.log("KLeoba Moxda ragaca Kuradgeba Miakciee !!!!!");
                console.log(e);
            }
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

        getTotalUserCount: function () {
            return userCount;
        },

        eachUserInChannel: function (channel, callback) {
            try {
                channelList.getElement(channel).eachElement(callback);
            } catch (e) {
                console.log("KLeoba Moxda ragaca Kuradgeba Miakciee !!!!!");
                console.log(e);
            }
        },

        eachUserInEveryChannel: function (callback) {
            channelList.eachElement(function (elem) {
                var userList = channelList.getElement(elem);
                if (userList) {
                    userList.eachElement(callback);
                } else {
                    console.log("Ratoa ees Null ??");
                    console.log(elem);
                }
            });
        }
    };
};

module.exports = channelManager;