const WebSocket = require("ws");
const ws = new WebSocket("ws://localhost:40001");

ws.on("message", data => {
    console.log(data);
})