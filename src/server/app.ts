import * as Express from 'express'
import { log } from '../lib/log';
import bodyParser = require('body-parser');

const app = Express()

process.on('uncaughtException',error => {
    log.error(`${error.message}\n\n${error.stack}`)
    process.exit(1)
})

process.on('unhandledRejection',reason => {
    log.warning(`Unhandled Rejection: ${reason}`)
})

app.use(Express.static(__dirname+'/../public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req,res) => {
    res.sendFile(__dirname+'/../public/index.html')
})

app.listen(3002, () => {
    log.start('Server started on port: 3002')
})