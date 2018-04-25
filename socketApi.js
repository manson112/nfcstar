var socket_io = require('socket.io');
var io = socket_io();
var socketApi = {};

socketApi.io = io;

io.on('connection', function(socket) {
    socket.on('disconnect', function(){
    });
});

socketApi.sendPosCall = function(stoseq) {
    //주문 
    console.log("sendPosCall");
    let obj = new Object();
    obj.MSGTYP = "CALL";
    io.sockets.emit(stoseq+"_POS", obj);
};

socketApi.sendPosImageCall = function(stoseq) {
    //사용자 이미지 전송
    console.log("sendImageCall");
    let obj = new Object();
    obj.MSGTYP = "CALL";
    io.sockets.emit(stoseq+"_PICTURE_ALARM", obj);
};

socketApi.sendAlarmCall = function(stoseq) {
    //사용자의 채팅 전송
    let obj = new Object();
    obj.MSGTYP = "CALL";
    io.sockets.emit(stoseq+"_ALARM", obj);
}

socketApi.sendUserCall = function(stoseq) {
    //포스 -> 딩동이 아랫줄
    let obj = new Object();
    obj.MSGTYP = "CALL";
    io.sockets.emit(stoseq+"_ALARM_FROM_POS", obj);
}

var onStoreSeqReceived = function(msg) {
    var stoseq = msg;
    
};

module.exports = socketApi;