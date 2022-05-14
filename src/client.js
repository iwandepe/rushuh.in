import $ from "jquery";
import { showIncomingChat, showSystemChat, addPlayerToList } from "./chat";

/**
 * File for configuring connection between client and server
 */

// USERNAME != CLIENTID
let clientId = null;
let username = null;
let roomId = null;
let playerColor = null;

let messages = [];

const PORT_SERVER = 8081;

let ws = new WebSocket("ws://localhost:" + PORT_SERVER);
const btnCreate = document.getElementById("btnCreate");
const btnJoin = document.getElementById("btnJoin");
const txtRoomId = document.getElementById("txtRoomId");
const divPlayers = document.getElementById("divPlayers");
const divBoard = document.getElementById("divBoard");

// wiring events
btnJoin.addEventListener("click", e => {

    if (roomId === null)
        roomId = txtRoomId.value;
    
    const payLoad = {
        "method": "join",
        "clientId": clientId,
        "roomId": roomId
    }

    console.log(payLoad);

    ws.send(JSON.stringify(payLoad));
    updateCanvasState(true);


})

function createRoom() {
    const payLoad = {
        "method": "create",
        "clientId": clientId
    }

    ws.send(JSON.stringify(payLoad));  
    updateCanvasState(true);
}
btnCreate.addEventListener("click", createRoom);

function messageToServer(msg) {
    const payLoad = {
        "method": "message",
        "clientId": clientId,
        "roomId": roomId,
        "message": msg
    }

    ws.send(JSON.stringify(payLoad));
}

function messageToPlayer(msg, playerId) {
    const payLoad = {
        "method": "message",
        "clientId": clientId,
        "target": playerId,
        "roomId": roomId,
        "message": msg
    }

    ws.send(JSON.stringify(payLoad));
}

$('#room-id').on('click', function() {
    navigator.clipboard.writeText(roomId);
    // alert("Copied text: " + roomId);
});
// $('#room-id').on('mouseover', function() {
//     if(roomId != 'Not Joined'){
//         if(roomId)
//             this.value = "Copy RoomID";
//     }
// });
// $('#room-id').on('mouseout', function() {
//     if(roomId != 'Not Joined'){
//         if(roomId)
//             this.value = roomId;
//         else
//             this.value = 'Not Joined'
//     }
// });

$('#username').on('change', function() {
    username = this.value;
});

function updateCanvasState(shown) {
    $('#canvascontainer').toggleClass('hidden');
    $('#splash').toggleClass('hidden');
    
    $('#btnSend').prop('disabled', !shown);
    $('#chat-input').prop('disabled', !shown);
}

ws.onmessage = message => {
    // message.data
    const response = JSON.parse(message.data);

    // connect
    if (response.method === "connect"){
        clientId = response.clientId;
        $('#username').val(clientId);
        username = clientId;
    }

    // create
    if (response.method === "create"){
        roomId = response.room.id;
        $('#room-id').prop('disabled', false);
        $('#room-id').val(roomId);
    }

    // update
    if (response.method === "update"){
        
        // not implemented

    }

    // join
    if (response.method === "join"){
        roomId = response.room.id;
        $('#room-id').prop('disabled', false);
        $('#room-id').val(roomId);

        // Setiap menerima join baru, update UI player list
        addPlayerToList(response.newPlayer);

        // Draw notification of new player has joined
        showSystemChat(response.newPlayer + ' has joined the room');
    }

    // chat
    if (response.method === "message"){
        messages = response.messages;
        console.log(messages);
        if(messages.sender != clientId){
            showIncomingChat(messages.sender, messages.message);
        }
    }
}

export { messageToServer };