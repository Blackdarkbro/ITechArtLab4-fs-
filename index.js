const http = require('http');
const url = require("url");

const controller = require("./controller.js");
let studentController = new controller();

const port = 40001;

let server = http.createServer();


let http_404 = (req, res) => {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end(`${req.url} no such page :( 404`);
}
let http_405 = (req, res) => {
    res.writeHead(405, { "content-type": "text/plain; charset=utf-8" });
    res.end(`${req.method} Не поддерживаемый метод`);
}

let GET_handler = (req, res) => {
    let studentId = url.parse(req.url).path;

    switch (req.url) {
        case "/":
            studentController.getStudentList(req, res);
            break;
        case "/backup":
            studentController.getBackups(req, res);
            break;
        case studentId:
            studentController.getStudentInfo(req, res, studentId.slice(1));
            break;
        default:
            http_404(req, res);
    }
}
let POST_handler = (req, res) => {
    switch (req.url) {
        case "/":
            studentController.sendStudent(req, res);
            break;
        case "/backup":
            studentController.createBackup(req, res);
            break;
        default:
            http_404(req, res);
    }
}
let PUT_handler = (req, res) => {
    switch (req.url) {
        case "/":
            studentController.changeStudentInfo(req, res);
            break;
        default:
            http_404(req, res);
    }
}
let DELETE_handler = (req, res) => {
    let studentId = url.parse(req.url).path;

    switch (req.url) {
        case `/backup/${studentId.slice(8)}`:
            studentController.deleteBackups(req, res, studentId.slice(8, 16));
            break;
        case studentId:
            studentController.deleteStudent(req, res, studentId.slice(1));
            break;
        default:
            http_404(req, res);
    }
}

let http_handler = (req, res) => {
    switch (req.method) {
        case "GET":
            GET_handler(req, res);
            break;
        case "POST":
            POST_handler(req, res);
            break;
        case "PUT":
            PUT_handler(req, res);
        case "DELETE":
            DELETE_handler(req, res);
            break;
        default:
            http_405(req, res);
            break;
    }
}

server.listen(port, () => console.log(`Server listening on port ${port}`))
    .on('error', e => console.error(`Server error: ${e.code}, ${e.message}`))
    .on('request', http_handler);