var socket_io = require('socket.io');
var io = socket_io();
var socketApi = {};

socketApi.io = io;

io.on('connection', function(socket) {
    console.log("A user connected");
    socket.emit("messageFromServer", "GIGI");
    socket.on('messageFromClient_stoseq', onStoreSeqReceived);
    socket.on('messageFromClient', function(msg) {
        console.log(msg);
        socket.emit('messageReceiveComplete', 100);
    });
    socket.on('disconnect', function(){
        console.log('user disconneted');
    });
});

socketApi.sendNotification = function() {
    io.sockets.emit("messageFromServer", {msg : 'Hi'});
};

var onStoreSeqReceived = function(msg) {
    var stoseq = msg;
    
};

module.exports = socketApi;