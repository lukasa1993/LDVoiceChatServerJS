/**
 * Created By:
 * User: lukasa
 * Date: 3/22/13
 * Time: 5:40 PM
 */


var userManager = function LDUserManager(server, msgpack) {
    var jsHashMap = require('./LDJSHashMap.js')
        , channelManagerFunc = require('./LDJSHashMap.js')
        , channelManager = channelManagerFunc();

    return {
        createOrUpdateUser: function (name, channel, remote) {
            var user;
            if (!(user = channelManager.getUserByChannelAndName(channel, name))) {
                user = {
                    name:                name,
                    userConnection:      remote,
                    muteList:            jsHashMap(),
                    channel:             channel,
                    lastPackageReceived: new Date()
                };

                channelManager.registerUserOnChannel(channel, user);
                userManager.informUserListChangedInChannel(channel);
            }

            user.lastPackageReceived = new Date();
            user.userConnection = remote;
            return user;
        },

        disconectUser: function (user) {
            channelManager.deRegisterUserOnChannelByName(user.name);
            userManager.informUserListChangedInChannel(user.channel);

            console.log(user.userConnection.address + ':' + user.userConnection.port + ' Registered As '
                + user.name + ' Disconnected');
        },

        renameUser: function (user, currentName) {
            if (currentName.length > 0) {
                channelManager.renameUserInChannel(user, currentName);
                userManager.informUserListChangedInChannel(user.channel);

                console.log(user.userConnection.address + ':' + user.userConnection.port + ' Registered As '
                    + user.name + ' Renamed Into ' + currentName);
            } else {
                userManager.disconectUser(user);
            }
        },

        spreadTheWord: function (user, packet) {
            channelManager.eachUserInChannel(user.channel, function (elem) {
                if (!userManager.compareUsers(elem, user) && !user.muteList.getElement(elem.name)) {
                    userManager.checkAndSend(elem, packet);
                }
            });
        },

        checkAndSend: function (user, packet) {
            if (user.name && userManager.checkUserState(user)) {
                server.send(packet, 0, packet.length,
                    user.userConnection.port, user.userConnection.address, null);
                console.log('Packet of Length ' + packet.length + ' Sent To '
                    + user.userConnection.address + ':' + user.userConnection.port
                    + ' Registered As ' + user.name);
            }
            else {
                userManager.disconectUser(user);
            }
        },

        checkUserState: function (user) {
            var timeDiff = (new Date() - user.lastPackageReceived) / 1000;
            if (timeDiff > server.userTimeOut / 3) {
                console.log(user.userConnection.address + ':' + user.userConnection.port + ' Registered As '
                    + user.name + ' Idle For: ' + timeDiff);
            }
            return timeDiff < server.userTimeOut;
        },

        compareUsers: function (user1, user2) {
            var sameUsers = false;
            if (user1.name == user2.name) {
                if (user1.userConnection && user2.userConnection) {
                    sameUsers = (user1.userConnection.port == user2.userConnection.port) &&
                        (user1.userConnection.address == user2.userConnection.address);
                } else {
                    sameUsers = true;
                }
            }
            return sameUsers;
        },

        userMutes: function (user, villain) {
            user.muteList.addElement(villain, null);
        },

        userUnMutes: function (user, villain) {
            user.muteList.removeElement(villain);
        },

        informUserListChangedInChannel: function (channel) {
            channelManager.eachUserInChannel(channel, function (receiver) {
                var usersPacked = [];
                channelManager.eachUserInChannel(channel, function (user) {
                    if (!userManager.compareUsers(receiver, user)) {
                        usersPacked.push(user);
                    }
                });
                userManager.checkAndSend(receiver, msgpack.pack({
                    action:   'list',
                    name:     'server',
                    userList: usersPacked
                }));
            });
        }
    };
};

module.exports = userManager;