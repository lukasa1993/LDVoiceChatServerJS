/**
 * Created By:
 * User: lukasa
 * Date: 3/19/13
 * Time: 6:43 PM
 */

var PORT = 4444
    , HOST = '127.0.0.1'
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
        , registriredUser;

    if ((action = packet.action) && (name = packet.name)) {
        console.log('Packet of Length ' + message.length + ' Received From ' +
            remote.address + ':' + remote.port + ' Named ' + name);
        registriredUser = userManager.createOrUpdateUser(name, remote);
        switch (action) {
            case 'disc':
                userManager.disconectUser(registriredUser);
                break;
            case 'rename':
                userManager.renameUser(registriredUser, unpacked.currentName);
                break;
            case 'voice':
                userManager.spreadTheWord(registriredUser, message);
                break;
        }
    }
});

server.bind(PORT, HOST);


