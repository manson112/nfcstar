var socket_io = require('socket.io');
var io = socket_io();
var socketApi = {};

socketApi.io = io;

io.on('connection', function(socket) {
    socket.on('disconnect', function(){
    });
});

socketApi.sendPosCall = function(stoseq) {
    console.log("sendPosCall");
    let obj = new Object();
    obj.MSGTYP = "CALL";
    io.sockets.emit(stoseq+"_POS", obj);
};

socketApi.sendPosImageCall = function(stoseq) {
    console.log("sendImageCall");
    let obj = new Object();
    obj.MSGTYP = "CALL";
    io.sockets.emit(stoseq+"_PICTURE_ALARM", obj);
};

socketApi.sendAlarmCall = function(stoseq) {
    console.log("sendAlarmCall");
    let obj = new Object();

    obj.MSGTYP = "CALL";
    io.sockets.emit(stoseq+"_ALARM", obj);
}

var onStoreSeqReceived = function(msg) {
    var stoseq = msg;
    
};

module.exports = socketApi;