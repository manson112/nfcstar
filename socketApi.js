var socket_io = require('socket.io');
var io = socket_io();
var socketApi = {};

socketApi.io = io;

io.on('connection', function(socket) {
    console.log("A user connected");


    socket.on('disconnect', function(){
        console.log('user disconneted');
    });
});

socketApi.sendPosCall = function(stoseq) {
    let obj = new Object();
    obj.MSGTYP = "CALL";
    io.sockets.emit(stoseq+"_POS", obj);
};

socketApi.sendPosImageCall = function(stoseq) {
    let obj = new Object();
    obj.MSGTYP = "CALL";
    io.sockets.emit(stoseq+"_PICTURE_ALARM", obj);
};

socketApi.sendAlarmCall = function(stoseq) {
    let obj = new Object();

    obj.MSGTYP = "CALL";
    io.sockets.emit(stoseq+"_ALARM", obj);
}

var onStoreSeqReceived = function(msg) {
    var stoseq = msg;
    
};

module.exports = socketApi;