"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const moment = require("moment");
exports.consoleColours = {
    info: chalk_1.default.cyan,
    start: chalk_1.default.green,
    success: chalk_1.default.green,
    stop: chalk_1.default.red,
    error: chalk_1.default.red,
    status: chalk_1.default.magenta,
    warning: chalk_1.default.yellow,
    debug: chalk_1.default.magentaBright
};
function log(type, message, stringReplace = {}) {
    const dateTime = moment().format('YYYY-MM-DD HH:mm:ss');
    const logTypeLower = type.toLowerCase();
    const logTypeUpper = type.charAt(0).toUpperCase() + type.toLowerCase().slice(1);
    if (process.env.NODE_ENV === 'production' && logTypeLower === 'debug')
        return;
    message = message.replace(/<.+>/g, match => {
        return chalk_1.default.italic.blue(match);
    });
    for (let replaceKey in stringReplace) {
        message = message.replace(`{${replaceKey}}`, stringReplace[replaceKey]);
    }
    if (exports.consoleColours.hasOwnProperty(logTypeLower)) {
        const logTypeFormat = exports.consoleColours[logTypeLower](`[${logTypeUpper}]`);
        console.log(chalk_1.default `{grey ${dateTime}} ${logTypeFormat} ${message}`);
    }
    else {
        console.log(chalk_1.default `{grey ${dateTime}} [${logTypeUpper}] ${message}`);
    }
}
exports.log = log;
function debugLog(message, stringReplace = {}) {
    log('debug', message, stringReplace);
}
exports.debugLog = debugLog;
function errorLog(message, stringReplace = {}) {
    log('error', message, stringReplace);
}
exports.errorLog = errorLog;
//# sourceMappingURL=log.js.map