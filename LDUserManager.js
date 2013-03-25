/**
 * Created By:
 * User: lukasa
 * Date: 3/22/13
 * Time: 5:40 PM
 */


var userManager = function LDUserManager(server, msgpack) {
    var userList = require('./LDJSHashMap.js')();

    return {
        createOrUpdateUser: function (name, remote) {
            var user;
            if (!(user = userList.getElement(name))) {
                user = {
                    name:                name,
                    userConnection:      remote,
                    lastPackageReceived: new Date()
                };
                userList.addElement(name, user);
                this.informUserListChanged();
            }

            user.lastPackageReceived = new Date();
            return user;
        },

        disconectUser: function (user) {
            userList.removeElement(user.name);
            this.informUserListChanged();
            console.log(user.userConnection.address + ':' + user.userConnection.port + ' Registrired As '
                + user.name + ' Disconnected');
        },

        renameUser: function (user, currentName) {
            if (currentName.length > 0) {
                userList.changeKeyOfElement(user.name, currentName);
                console.log(user.userConnection.address + ':' + user.userConnection.port + ' Registrired As '
                    + user.name + ' Renamed Into ' + currentName);
            } else {
                userList.removeElement(user.name);
                console.log(user.userConnection.address + ':' + user.userConnection.port + ' Registrired As '
                    + user.name + ' Disconnected');
            }
            this.informUserListChanged();
        },

        spreadTheWord: function (user, packet) {
            var self = this;
            userList.eachElement(function (elem) {
                if (self.compareUsers(elem, user)) {
                    self.checkAndSend(elem, packet);
                }
            });
        },

        checkAndSend: function (user, packet) {
            if (user.name && this.checkUserState(user)) {
                server.send(packet, 0, packet.length,
                    user.userConnection.port, user.userConnection.address, null);
                console.log('Packet of Length ' + packet.length + ' Sent To '
                    + user.userConnection.address + ':' + user.userConnection.port + ' Registrired As ' + user.name);
            }
            else {
                this.disconectUser(user);
            }
        },

        checkUserState: function (user) {
            var timeDiff = (new Date() - user.lastPackageReceived) / 1000;
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

        informUserListChanged: function () {
            var self = this;
            userList.eachElement(function (receiver) {
                var usersPacked = [];
                userList.eachElement(function (user) {
                    if (self.compareUsers(receiver, user)) {
                        usersPacked.push(user);
                    }
                });
                self.checkAndSend(receiver, msgpack.pack({
                    action:   'list',
                    name:     'server',
                    userList: usersPacked
                }));
            });
        }
    };
}

module.exports = userManager;