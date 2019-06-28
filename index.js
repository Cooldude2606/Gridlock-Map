const Express = require('express')
const Render = require('./public/render')
const bodyParser = require('body-parser')
const app = Express()

Render.preload().catch(err => {
    process.exit()
})

app.use(Express.static(__dirname+'/public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.sendFile(__dirname+'/public/index.html');
})

app.post('/',async (req, res) => {
    Render.grid.import(req.body)
    console.log('Sent:')
    const data = await Render.grid.export()
    console.log(data)
    res.send(data)
})

app.listen(3002, () => {
    console.log('Server started on: 3002')
})