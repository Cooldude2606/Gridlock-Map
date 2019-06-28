"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Express = require("express");
const bodyParser = require("body-parser");
const log_1 = require("./lib/log");
const app = Express();
log_1.debugLog('Running in development env');
process.on('uncaughtException', error => {
    log_1.errorLog('{message}:\n\n{stack}', error);
    process.exit(1);
});
process.on('unhandledRejection', reason => {
    log_1.log('warning', `There was an unhandled rejection: ${reason}`);
});
app.use(Express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.listen(3002, () => {
    log_1.log('start', 'Server started on: 3002');
});
//# sourceMappingURL=index.js.map