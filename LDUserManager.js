/**
 * Created By:
 * User: lukasa
 * Date: 3/22/13
 * Time: 5:40 PM
 */


var userManager = function LDUserManager(server, msgpack) {
    var jsHashMap = require('./LDJSHashMap.js')
        , channelManagerFunc = require('./LDChannelManager.js')
        , SHA3 = require('sha3')
        , userList = jsHashMap()
        , channelManager = channelManagerFunc();


    var checkAndSend = function (user, packet) {
        if (checkUserState(user)) {
            server.send(packet, 0, packet.length,
                user.userConnection.port, user.userConnection.address, null);
//            console.log('Packet of Length ' + packet.length + ' Sent To '
//                + user.userConnection.address + ':' + user.userConnection.port
//                + ' Registered As ' + user.name);
            return true;
        } else {
            return false;
        }
    }, checkUserState = function (user) {
        var timeDiff = (new Date() - user.lastPackageReceived) / 1000;
        if (timeDiff > server.userTimeOut / 3) {
            console.log(user.userConnection.address + ':' + user.userConnection.port + ' Registered As '
                + user.name + ' Idle For: ' + timeDiff);
        }
        return timeDiff < server.userTimeOut;
    }, compareUsers = function (user1, user2) {
        return user1.userID == user2.userID;
    }, generateUserID = function (remote) {
        var keccak = new SHA3.SHA3Hash(224);
        keccak.update(remote.address + remote.port, 'ascii');
        return keccak.digest('hex');
    };

    return {
        createOrUpdateUser: function (name, channel, remote) {
            var user, userID = generateUserID(remote);
            if (server.connectionLimit >= userList.getElementCount()) {
                if (!(user = userList.getElement(userID))) {
                    user = {
                        userID:              userID,
                        name:                name,
                        userConnection:      remote,
                        channel:             channel,
                        muteList:            jsHashMap(),
                        lastPackageReceived: new Date()
                    };

                    userList.addElement(userID, user);
                    channelManager.registerUserOnChannel(user);
                    this.informUserListChangedInChannel(channel);
                } else {
                    user.lastPackageReceived = new Date();
                }
            } else {
                console.log("Connection OverFlow Buy Better Server ! ! !");
            }
            return user;
        },

        disconnectUser: function (user) {
            userList.removeElement(user.userID);
            channelManager.deRegisterUserOnChannelByName(user);
            this.informUserListChangedInChannel(user.channel);

            console.log(user.userConnection.address + ':' + user.userConnection.port + ' Registered As '
                + user.name + ' Disconnected');
        },

        switchChannel: function (user, channel) {
            if (channel.length > 0) {
                channelManager.switchUserChannel(user, channel);
                console.log(user.userConnection.address + ':' + user.userConnection.port + ' Registered As '
                    + user.name + ' Moved To ' + channel + ' Channel');
            } else {
                this.disconnectUser(user);
            }
        },

        renameUser: function (user, currentName) {
            if (currentName.length > 0) {
//                channelManager.renameUserInChannel(user, currentName);
                user.name = currentName;
                this.informUserListChangedInChannel(user.channel);

                console.log(user.userConnection.address + ':' + user.userConnection.port + ' Registered As '
                    + user.name + ' Renamed Into ' + currentName);
            } else {
                this.disconnectUser(user);
            }
        },

        spreadTheWord: function (user, packet) {
            var self = this;
            channelManager.eachUserInChannel(user.channel, function (elem) {
                if (!compareUsers(elem, user) && !elem.muteList.getElement(user.userID)) {
                    if (!checkAndSend(elem, packet)) {
                        self.disconnectUser(elem);
                    }
                }
            });
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
            if(userList.getElementCount() == 0) return;
            var self = this;
            channelManager.eachUserInChannel(channel, function (receiver) {
                var usersPacked = [];
                channelManager.eachUserInChannel(channel, function (user) {
                    if (!compareUsers(receiver, user)) {
                        var tmpUser = {};

                        Object.getOwnPropertyNames(user).forEach(function (val) {
                            if (val != 'muteList' && val != 'userConnection' && val != 'lastPackageReceived') {
                                tmpUser[val] = user[val];
                            }
                        });

                        tmpUser['muted'] = receiver.muteList.getElement(user.userID) ? true : false;
                        usersPacked.push(tmpUser);
                    }
                });
                var packed = msgpack.pack({
                    action:   'list',
                    name:     'server',
                    userList: usersPacked
                });

                if (!checkAndSend(receiver, packed)) {
                    self.disconnectUser(receiver);
                }
            });
        },

        checkForDeadPeople: function () {
            var deadPeople = 0, self = this;
            console.log("Running DeadPeople Check");
            channelManager.eachUserInEveryChannel(function (elem) {
                if (!checkUserState(elem)) {
                    self.disconnectUser(elem);
                    deadPeople++;
                }
            });
            console.log("DeadPeople Check Ended Found: " + deadPeople + " Corpses");
        }
    };
};

module.exports = userManager;