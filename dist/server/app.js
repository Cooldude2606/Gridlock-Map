"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Express = require("express");
var log_1 = require("../lib/log");
var bodyParser = require("body-parser");
var app = Express();
process.on('uncaughtException', function (error) {
    log_1.log.error(error.message + "\n\n" + error.stack);
    process.exit(1);
});
process.on('unhandledRejection', function (reason) {
    log_1.log.warning("Unhandled Rejection: " + reason);
});
app.use(Express.static(__dirname + '/../public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/../public/index.html');
});
app.listen(3002, function () {
    log_1.log.start('Server started on port: 3002');
});
