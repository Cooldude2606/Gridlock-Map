import Chalk from 'chalk';
import moment = require('moment');
import { Dictionary } from './defines';

export const consoleColours: Dictionary = {
    info: Chalk.cyan,
    start: Chalk.green,
    success: Chalk.green,
    stop: Chalk.red,
    error: Chalk.red,
    status: Chalk.magenta,
    warning: Chalk.yellow,
    debug: Chalk.magentaBright
}

export function logRaw(type: string, message: string, stringReplace: Dictionary = {}): void {
    const dateTime = moment().format('YYYY-MM-DD HH:mm:ss')
    const logTypeLower = type.toLowerCase()
    const logTypeUpper = type.charAt(0).toUpperCase()+type.toLowerCase().slice(1)
    if (process.env.NODE_ENV === 'production' && logTypeLower === 'debug') return
    message = message.replace(/<.+>/g,match => {
        return Chalk.italic.blue(match)
    })
    for (let replaceKey in stringReplace) {
        message = message.replace(`{${replaceKey}}`,stringReplace[replaceKey])
    }
    if (consoleColours.hasOwnProperty(logTypeLower)) {
        const logTypeFormat = consoleColours[logTypeLower](`[${logTypeUpper}]`)
        console.log(Chalk`{grey ${dateTime}} ${logTypeFormat} ${message}`)
    } else {
        console.log(Chalk`{grey ${dateTime}} [${logTypeUpper}] ${message}`)
    }
}

export const log = {
    info: (message: string): void => logRaw('info',message),
    start: (message: string): void => logRaw('start',message),
    success: (message: string): void => logRaw('success',message),
    stop: (message: string): void => logRaw('stop',message),
    error: (message: string): void => logRaw('error',message),
    status: (message: string): void => logRaw('status',message),
    warning: (message: string): void => logRaw('warning',message),
    debug: (message: string): void => logRaw('debug',message)
}

if (process.env.NODE_ENV != 'development') {
    process.env.NODE_ENV = 'production'
}

console.log(Chalk`{grey ${moment().format('YYYY-MM-DD HH:mm:ss')}} {magentaBright [DEBUG]} Running in ${process.env.NODE_ENV} env`)