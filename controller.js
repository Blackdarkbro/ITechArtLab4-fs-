const fs = require("fs");

module.exports = class StudentController {
    getStudentList = (req, res) => {
        res.writeHead(200, { "content-type": "application/json; charset=utf-8" });

        fs.readFile("./studentList.json", "utf-8", (err, data) => {
            if (err) throw err;
            res.end(data);
        });
    }

    getStudentInfo = (req, res, studentId) => {

        fs.readFile("./studentList.json", "utf-8", (err, data) => {
            if (err) throw err;

            let studentList = JSON.parse(data);
            let flag = false;

            studentList.forEach(student => {
                if (student.id == studentId) {
                    flag = true;
                    res.writeHead(400, { "content-type": "application/json; charset=utf-8" });
                    res.end(JSON.stringify(student));
                }
            });

            if (!flag) {
                res.writeHead(400, { "content-type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ error: `студена с id ${studentId} не существует` }))
            }
        });
    }

    deleteStudent = (req, res, studentId) => {

        fs.readFile("./studentList.json", "utf-8", (err, data) => {
            if (err) throw err;

            let studentList = JSON.parse(data);
            let flag = false;

            studentList.forEach((student, index) => {
                if (student.id == studentId) {
                    studentList.splice(index, 1);

                    fs.writeFile("./studentList.json", JSON.stringify(studentList), (error) => {
                        if (err) throw err;
                    });

                    flag = true;
                    res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
                    res.end(JSON.stringify(student));
                }
            });

            if (!flag) {
                res.writeHead(400, { "content-type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ error: `студена с id ${studentId} не существует` }))
            }
        });
    }

    sendStudent = (req, res) => {
        if (req.headers["content-type"] === "application/json") {
            let result = "";

            req.on("data", chunk => result += chunk);
            req.on("end", () => {
                try {
                    let student = JSON.parse(result);
                    let flag = false;

                    let studentList = JSON.parse(fs.readFileSync("./studentList.json"));
                    studentList.forEach((elem) => {
                        if (elem.id === student.id) {
                            res.writeHead(400, { "content-type": "application/json; charset=utf-8" });
                            res.end(JSON.stringify({ error: `студент с id ${student.id} уже существует` }));

                            flag = true;
                        }
                    });

                    if (!flag) {
                        studentList.push(student);
                        fs.writeFileSync("./studentList.json", JSON.stringify(studentList));

                        res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
                        res.end(JSON.stringify(student));
                    }
                } catch {
                    res.writeHead(415, { "content-type": "application/json; charset=utf-8" });
                    res.end(JSON.stringify({ error: `Неверный формат JSON` }));
                }
            });
        }
    }

    changeStudentInfo = (req, res) => {
        if (req.headers["content-type"] === "application/json") {
            let result = "";

            req.on("data", chunk => result += chunk);
            req.on("end", () => {
                try {
                    let student = JSON.parse(result);
                    let flag = false;

                    let studentList = JSON.parse(fs.readFileSync("./studentList.json"));
                    studentList.forEach((elem, index) => {
                        if (elem.id === student.id) {
                            studentList[index] = student;
                            fs.writeFileSync("./studentList.json", JSON.stringify(studentList));

                            res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
                            res.end(JSON.stringify(student));

                            flag = true;
                        }
                    });

                    if (!flag) {
                        res.writeHead(400, { "content-type": "application/json; charset=utf-8" });
                        res.end(JSON.stringify({ error: `студента с id ${student.id} не существует` }));
                    }
                } catch {
                    res.writeHead(415, { "content-type": "application/json; charset=utf-8" });
                    res.end(JSON.stringify({ error: `Неверный формат JSON` }));
                }
            });
        }
    }

    createBackup = (req, res) => {
        let dateNow = new Date();
        let month = dateNow.getMonth() < 10 ? "0" + dateNow.getMonth() : dateNow.getMonth();
        let day = dateNow.getDate() < 10 ? "0" + (1 + dateNow.getDate()) : dateNow.getDate() + 1;
        let hour = dateNow.getHours() < 10 ? "0" + dateNow.getHours() : dateNow.getHours();
        let minutes = dateNow.getMinutes() < 10 ? "0" + dateNow.getMinutes() : dateNow.getMinutes();
        let seconds = dateNow.getSeconds() < 10 ? "0" + dateNow.getSeconds() : dateNow.getSeconds();

        let dateString = "" + dateNow.getFullYear() + month + day + hour + minutes + seconds;


        setTimeout(() => {
            let readableStream = fs.createReadStream("./studentList.json", "utf-8");
            let writeableStream = fs.createWriteStream(`./backups/${dateString}_studentList.json`);

            readableStream.pipe(writeableStream);
        }, 2000);

        res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ message: `Копия создана` }));
    }

    getBackups = (req, res) => {
        fs.readdir("backups", "utf-8", (err, files) => {

            files.forEach((vale, index) => {
                files[index] = { "file": vale }
            });

            res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
            res.end(JSON.stringify(files));
        });
    }

    deleteBackups = (req, res, date) => {

        if (isNaN(date) || date.length !== 8) {
            res.writeHead(415, { "content-type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ "error": "Путь должен быть backup/YYYYMMDD где YYYYMMDD - числа длинной 8 символов" }));

        } else {
            fs.readdir("backups", "utf-8", (err, files) => {

                files.forEach((file, index) => {

                    if (+file.slice(0, 8) < date) {
                        fs.unlink(`backups/${file}`, err => {
                            if (err) throw err;
                        })
                    }
                })
                res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ "message": "файлы удалены" }));
            });
        }
    }
}