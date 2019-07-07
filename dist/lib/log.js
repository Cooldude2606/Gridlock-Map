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
function logRaw(type, message, stringReplace = {}) {
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
exports.logRaw = logRaw;
exports.log = {
    info: (message) => logRaw('info', message),
    start: (message) => logRaw('start', message),
    success: (message) => logRaw('success', message),
    stop: (message) => logRaw('stop', message),
    error: (message) => logRaw('error', message),
    status: (message) => logRaw('status', message),
    warning: (message) => logRaw('warning', message),
    debug: (message) => logRaw('debug', message)
};
if (process.env.NODE_ENV != 'development') {
    process.env.NODE_ENV = 'production';
}
console.log(chalk_1.default `{grey ${moment().format('YYYY-MM-DD HH:mm:ss')}} {magentaBright [DEBUG]} Running in ${process.env.NODE_ENV} env`);
