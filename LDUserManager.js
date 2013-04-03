/**
 * Created By:
 * User: lukasa
 * Date: 3/22/13
 * Time: 5:40 PM
 */


var userManager = function LDUserManager(server, msgpack) {
    var jsHashMap = require('./LDJSHashMap.js')
        , channelManagerFunc = require('./LDChannelManager.js')
        , channelManager = channelManagerFunc();

    return {
        createOrUpdateUser: function (name, channel, remote) {
            var user;
            if (!(user = channelManager.getUserByChannelAndName(channel, name)) &&
                server.connectionLimit >= channelManager.getTotalUserCount()) {
                user = {
                    name:                name,
                    userConnection:      remote,
                    muteList:            jsHashMap(),
                    channel:             channel,
                    lastPackageReceived: new Date()
                };

                channelManager.registerUserOnChannel(channel, user);
                this.informUserListChangedInChannel(channel);
            }

            user.lastPackageReceived = new Date();
            user.userConnection = remote;
            return user;
        },

        disconectUser: function (user) {
            channelManager.deRegisterUserOnChannelByName(user);
            this.informUserListChangedInChannel(user.channel);

            console.log(user.userConnection.address + ':' + user.userConnection.port + ' Registered As '
                + user.name + ' Disconnected');
        },

        renameUser: function (user, currentName) {
            if (currentName.length > 0) {
                channelManager.renameUserInChannel(user, currentName);
                this.informUserListChangedInChannel(user.channel);

                console.log(user.userConnection.address + ':' + user.userConnection.port + ' Registered As '
                    + user.name + ' Renamed Into ' + currentName);
            } else {
                this.disconectUser(user);
            }
        },

        spreadTheWord: function (user, packet) {
            var self = this;
            channelManager.eachUserInChannel(user.channel, function (elem) {
                if (!self.compareUsers(elem, user) && !elem.muteList.getElement(user.name)) {
                    self.checkAndSend(elem, packet);
                }
            });
        },

        checkAndSend: function (user, packet) {
            if (user.name && this.checkUserState(user)) {
                server.send(packet, 0, packet.length,
                    user.userConnection.port, user.userConnection.address, null);
                console.log('Packet of Length ' + packet.length + ' Sent To '
                    + user.userConnection.address + ':' + user.userConnection.port
                    + ' Registered As ' + user.name);
            } else {
                this.disconectUser(user);
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
            console.log(user.userConnection.address + ':' + user.userConnection.port + ' Registered As '
                + user.name + ' Muted ' + villain);
            user.muteList.addElement(villain, true);
        },

        userUnMutes: function (user, villain) {
            console.log(user.userConnection.address + ':' + user.userConnection.port + ' Registered As '
                + user.name + ' UnMuted ' + villain);
            user.muteList.removeElement(villain);
        },

        informUserListChangedInChannel: function (channel) {
            var self = this;
            channelManager.eachUserInChannel(channel, function (receiver) {
                var usersPacked = [];
                channelManager.eachUserInChannel(channel, function (user) {
                    if (!self.compareUsers(receiver, user)) {
                        var tmpUser = {};
                        Object.getOwnPropertyNames(user).forEach(function (val, idx, array) {
                            if (val != 'muteList' && val != 'userConnection' && val != 'lastPackageReceived') {
                                tmpUser[val] = user[val];
                            }
                        });

                        tmpUser['muted'] = receiver.muteList.getElement(user.name) ? true : false;
                        usersPacked.push(tmpUser);
                    }
                });
                self.checkAndSend(receiver, msgpack.pack({
                    action:   'list',
                    name:     'server',
                    userList: usersPacked
                }));
            });
        },

        checkForDeadPeople: function () {
            var deadPeople = 0;
            console.log("Running DeadPeople Check");
            channelManager.eachUserInEveryChannel(function (elem) {
                if (!this.checkUserState(elem)) {
                    this.disconectUser(elem);
                    deadPeople++;
                }
            });
            console.log("DeadPeople Check Ended Found: " + deadPeople + " Corpses");
        }
    };
};

module.exports = userManager;