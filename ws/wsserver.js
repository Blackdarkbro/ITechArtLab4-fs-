const WebSocket = require("ws");
const fs = require("fs");


const wsserver = new WebSocket.Server({ port: 40001, host: "localhost" });

wsserver.on('connection', ws => {
    fs.readdir("../backups", (err, files) => {

        files.forEach(file => {
            fs.watchFile(`../backups/${file}`, (curr, prev) => {
                ws.send(`${file.toLocaleLowerCase()} был изменён ${curr.mtime}`);
            })
        })
    })
});