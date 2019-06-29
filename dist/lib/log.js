"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = require("chalk");
var moment = require("moment");
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
function logRaw(type, message, stringReplace) {
    if (stringReplace === void 0) { stringReplace = {}; }
    var dateTime = moment().format('YYYY-MM-DD HH:mm:ss');
    var logTypeLower = type.toLowerCase();
    var logTypeUpper = type.charAt(0).toUpperCase() + type.toLowerCase().slice(1);
    if (process.env.NODE_ENV === 'production' && logTypeLower === 'debug')
        return;
    message = message.replace(/<.+>/g, function (match) {
        return chalk_1.default.italic.blue(match);
    });
    for (var replaceKey in stringReplace) {
        message = message.replace("{" + replaceKey + "}", stringReplace[replaceKey]);
    }
    if (exports.consoleColours.hasOwnProperty(logTypeLower)) {
        var logTypeFormat = exports.consoleColours[logTypeLower]("[" + logTypeUpper + "]");
        console.log(chalk_1.default(templateObject_1 || (templateObject_1 = __makeTemplateObject(["{grey ", "} ", " ", ""], ["{grey ", "} ", " ", ""])), dateTime, logTypeFormat, message));
    }
    else {
        console.log(chalk_1.default(templateObject_2 || (templateObject_2 = __makeTemplateObject(["{grey ", "} [", "] ", ""], ["{grey ", "} [", "] ", ""])), dateTime, logTypeUpper, message));
    }
}
exports.logRaw = logRaw;
exports.log = {
    info: function (message) { return logRaw('info', message); },
    start: function (message) { return logRaw('start', message); },
    success: function (message) { return logRaw('success', message); },
    stop: function (message) { return logRaw('stop', message); },
    error: function (message) { return logRaw('error', message); },
    status: function (message) { return logRaw('status', message); },
    warning: function (message) { return logRaw('warning', message); },
    debug: function (message) { return logRaw('debug', message); }
};
if (process.env.NODE_ENV != 'development') {
    process.env.NODE_ENV = 'production';
}
console.log(chalk_1.default(templateObject_3 || (templateObject_3 = __makeTemplateObject(["{grey ", "} {magentaBright [DEBUG]} Running in ", " env"], ["{grey ", "} {magentaBright [DEBUG]} Running in ", " env"])), moment().format('YYYY-MM-DD HH:mm:ss'), process.env.NODE_ENV));
var templateObject_1, templateObject_2, templateObject_3;
