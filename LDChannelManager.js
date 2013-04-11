/**
 * Created By:
 * User: lukasa
 * Date: 3/22/13
 * Time: 5:40 PM
 */


var channelManager = function LDChannelManager() {
    var jsHashMap = require('./LDJSHashMap.js')
        , channelList = jsHashMap();

    var addUserInChannel = function (user) {
        var channel = channelList.getElement(user.channel);
        if (!channel) {
            channelList.addElement(user.channel, jsHashMap());
            channel = channelList.getElement(user.channel);
        }
        channel.addElement(user.userID, user);
    }, removeUserFromChannel = function (user) {
        var channel = channelList.getElement(user.channel);
        if (channel) {
            channel.removeElement(user.userID);
            if (channel.getElementCount() == 0) {
                channelList.removeElement(user.channel);
            }
        }
    };

    return {
        registerUserOnChannel: function (user) {
            try {
                addUserInChannel(user);
            } catch (e) {
                console.error("KLeoba Moxda ragaca Kuradgeba Miakciee 0 !!!!!");
                console.error(e);
            }
        },

        deRegisterUserOnChannelByName: function (user) {
            try {
                removeUserFromChannel(user);
            } catch (e) {
                console.error("KLeoba Moxda ragaca Kuradgeba Miakciee 1 !!!!!");
                console.error(e);
            }
        },

        switchUserChannel: function (user, currentChannel) {
            try {
                removeUserFromChannel(user);
                user.channel = currentChannel;
                addUserInChannel(user);
            } catch (e) {
                console.error("KLeoba Moxda ragaca Kuradgeba Miakciee 2 !!!!!");
                console.error(e);
            }
        },

        eachUserInChannel: function (channel, callback) {
            try {
                channelList.getElement(channel).eachElement(callback);
            } catch (e) {
                console.error("KLeoba Moxda ragaca Kuradgeba Miakciee 4 !!!!!");
                console.error(e);
            }
        }
    };
};

module.exports = channelManager;