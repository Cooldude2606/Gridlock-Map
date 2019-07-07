"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Express = require("express");
const log_1 = require("../lib/log");
const bodyParser = require("body-parser");
const app = Express();
process.on('uncaughtException', error => {
    log_1.log.error(`${error.message}\n\n${error.stack}`);
    process.exit(1);
});
process.on('unhandledRejection', reason => {
    log_1.log.warning(`Unhandled Rejection: ${reason}`);
});
app.use(Express.static(__dirname + '/../public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/../public/index.html');
});
app.listen(3002, () => {
    log_1.log.start('Server started on port: 3002');
});
