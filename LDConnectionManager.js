/**
 * Created By:
 * User: lukasa
 * Date: 3/19/13
 * Time: 6:43 PM
 */

var PORT = 4444
    , HOST = '192.168.1.111'
    , dgram = require('dgram')
    , msgpack = require('./msgpack')
    , userManagerFunc = require('./LDUserManager.js')
    , server = dgram.createSocket('udp4')
    , userManager = userManagerFunc(server, msgpack);

server.userTimeOut = 60;
server.sendTo = function (userConnection, packet) {
    server.send(packet, 0, packet.length, userConnection.port, userConnection.address, null);
};

server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

server.on('message', function (message, remote) {
    var packet = msgpack.unpack(message)
        , action
        , name
        , registriredUser
        , channel;

    if ((action = packet.action) && (name = packet.name) && (channel = packet.channel)) {
        console.log('Packet of Length ' + message.length + ' Received From ' +
            remote.address + ':' + remote.port + ' Named ' + name +
            'On Channel: ' + channel);
        registriredUser = userManager.createOrUpdateUser(name, channel, remote);
        switch (action) {
            case 'init':
                userManager.informUserListChangedInChannel(channel);
                break;
            case 'disc':
                userManager.disconectUser(registriredUser);
                break;
            case 'rename':
                userManager.renameUser(registriredUser, packet['currentName']);
                break;
            case 'voice':
                userManager.spreadTheWord(registriredUser, message);
                break;
            case 'mute':
                userManager.userMutes(registriredUser, packet['villain']);
                break;
            case 'unmute':
                userManager.userUnMutes(registriredUser, packet['villain']);
                break;
        }
    }
});

server.bind(PORT, HOST);


