import * as Express from 'express'
import bodyParser = require('body-parser');
import { log, debugLog, errorLog } from './lib/log';

const app = Express()

debugLog('Running in development env')
process.on('uncaughtException',error => {
    errorLog('{message}:\n\n{stack}',error)
    process.exit(1)
})

process.on('unhandledRejection',reason => {
    log('warning',`There was an unhandled rejection: ${reason}`)
})

app.use(Express.static(__dirname))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.sendFile(__dirname+'/index.html');
})

app.listen(3002, () => {
    log('start','Server started on: 3002')
})