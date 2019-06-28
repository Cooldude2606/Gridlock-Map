// graphic settings
const scaleFactor = config.graphic.scaleFactor // scale finnal image up by this ammount
const tileSize = config.graphic.tileSize // size of each tile on the sprite sheet
const verticalSprites = config.graphic.verticalSprites // the direction of the sprites
const assetsPath = config.graphic.assetsPath // path to assets
let viewMode = false

// tile types, each tile is givem a sprite sheet for each timer value
const Tiles = config.tiles
const Logos = config.logos
Logos.unshift(undefined)

// first hidden not needed as any value less than first offline must be hidden
// each group of timer values is grouped and this decideces how their will connect
// the sprite sheet used is the lowest of the two, the higher level tile will be offset by 4
const connectionFirstOffline = config.connections.connectionFirstOffline
const connectionFirstTimer = config.connections.connectionFirstTimer
const connectionFirstOnline = config.connections.connectionFirstOnline
const Connections = config.connections.types

class Grid {
    constructor(x,y) {
        this.sizex=x
        this.sizey=y
        this._grid = Array.apply(null,Array(y)).map((n,oy) => Array.apply(null,Array(x)).map((n,ox) => new Tile(this,ox,oy,0,0)))
    }
    // creates a canvas that is the same size as the grid
    createCanvas() {
        // if a canvas is already made then it is removed
        if (this.canvas) this.canvas.remove()
        // new one is made and drop event and parent are set up
        this.canvas = createCanvas(tileSize*grid.sizex*scaleFactor, tileSize*grid.sizey*scaleFactor)
        this.canvas.drop(file => this.import(file))
        this.canvas.parent('frame')
        // used to provent scaling of the tile when scaled up; keeps a sharp image
        let context = this.canvas.elt.getContext('2d');
        context.imageSmoothingEnabled = false;
        return this.canvas
    }
    // sets tiles to redirect to this tile
    setRedirects(tile,reset) {
        const [x,y] = tile.position
        const [sx,sy] = tile.size
        // loops over all tile in the area of the tile
        for (let oy = 0; oy < sy; oy++) {
            for (let ox = 0; ox < sx; ox++) {
                // each tile that is not the top left is given a redirect
                let ctile = this.getTile(x+ox,y+oy)
                if (ctile && ctile != tile) {
                    // if the tile already has a redirect then it fails; other code with provent tile creation
                    if (ctile.redirect != tile && ctile._redirectSign == ctile.redirect.size[0]+','+ctile.redirect.size[1]) return false
                    if (reset) ctile.redirect = false
                    else ctile.redirect = tile
                }
            }
        }
        return true
    }
    // gets all tiles around the current tile
    getAdjacent(tile,includeSource) {
        const found = []
        function addAdjacent(grid,sX,sY,cX,cY) {
            const cTile = grid.getTile(cX,cY)
            if (!cTile) return
            if (includeSource) found.push([[sX,sY],cTile])
            else found.push(cTile)
        }
        // loops other all tiles on the eage of the tile
        let [sizex,sizey] = tile.size
        if (sizex == 0) sizex = 1
        if (sizey == 0) sizey = 1
        const [x,y] = tile.position
        for (let sY = 0; sY < sizey; sY++) {
            let sX = 0
            while (sX < sizex) {
                // test different directions based on which side the sub tile is on
                if (sY == 0) addAdjacent(this,x+sX,y+sY,x+sX,y+sY-1)
                if (sY ==    sizey-1) addAdjacent(this,x+sX,y+sY,x+sX,y+sY+1)
                if (sX == 0) addAdjacent(this,x+sX,y+sY,x+sX-1,y+sY)
                if (sX ==    sizex-1) addAdjacent(this,x+sX,y+sY,x+sX+1,y+sY)
                // increment x in a way to only include the eages
                if (sY == 0 || sY ==    sizey-1) sX++
                else sX =    sizex-1
            }
        }
        // returns the found tiles
        return found
    }
    // sets the timer value for all connected tiles, this gives the gradient effect
    setStates(tile,done=[],queue) {
        if (!queue) queue = [tile]
        // used to avoid exssessive number calculations
        const timerIncrement = (Connections[connectionFirstTimer][1]-Connections[connectionFirstTimer][0])/4
        const hiddenIncrement = Connections[connectionFirstOffline][1]/5
        const Con2_0 = Connections[connectionFirstTimer][0]
        // loops over the queue, which may to added to during the loop
        for (let queueIndex = 0; queueIndex < queue.length; queueIndex++) {
            let tile = queue[queueIndex]
            let [x,y] = tile.position
            if (tile && tile.redirect) {tile = tile.redirect;[x,y]=tile.position}
            if (tile && tile.size[0] > 0 && tile.size[1] > 0 && tile.state <= Connections[connectionFirstOffline][1] && done.indexOf(x+','+y) < 0) {
                // if the tile is not a null tile and is offline or hidden (and not already done)
                done.push(x+','+y)
                const adjacent = this.getAdjacent(tile)
                // loops over all the connected tile to find the new value of time for this tile
                let time = 0
                for (let i = 0; i < adjacent.length; i++) {
                    let check = adjacent[i]
                    if (check.redirect) check = check.redirect
                    let newTime = 0
                    // it = the tile being checked which is connected to this tile
                    // if it is an online tile then the new time would make this tile offline
                    if (check.state >= Connections[connectionFirstOnline][0]) newTime = Connections[connectionFirstOffline][0]
                    // if it is a timer tile then the new time would make this tile hidden
                    else if (check.state >= Con2_0+(timerIncrement*3)) newTime = hiddenIncrement*4
                    else if (check.state >= Con2_0+(timerIncrement*2)) newTime = hiddenIncrement*3
                    else if (check.state >= Con2_0+(timerIncrement*1)) newTime = hiddenIncrement*2
                    else if (check.state >= Con2_0) newTime = hiddenIncrement*1
                    // if it is a hidden tile then the new time would make this tile hidden
                    else newTime = check.state-1
                    // new value set if a higher one is found
                    if (time < newTime) time = newTime
                }
                // sets the new value of the tile timer
                tile.state = Math.ceil(time)
                // adds the connected tiles into the queue to have there timers set
                adjacent.forEach(cord => queue.push(cord))
            } else if (tile && tile.size[0] > 0 && tile.size[1] > 0 && done.indexOf(x+','+y) < 0) {
                // if the tile is not a null tile and is not offline or hidden (and not already done)
                done.push(x+','+y)
                const adjacent = this.getAdjacent(tile)
                // adds the connected tiles into the queue to have there timers set
                adjacent.forEach(cord => queue.push(cord))
            } else done.push(x+','+y)
        }
    }
    // gets the tile at a loction or returns underfined if not present
    getTile(x,y) {
        if (!this._grid[y] || !this._grid[y][x]) return
        return this._grid[y][x]
    }
    // takes a json and converts it to the grid
    import(file) {
        function loadData(grid,data) {
            // remakes an empty grid
            grid.sizex=data.size[0]
            grid.sizey=data.size[1]
            grid._grid = Array.apply(null,Array(data.size[1])).map((n,oy) => Array.apply(null,Array(data.size[0])).map((n,ox) => new Tile(grid,ox,oy,0,0)))
            // fills in all the values for the new grid
            data.grid.forEach(tileData => {
                let tile = grid.getTile(tileData.position[0],tileData.position[1])
                tile.size = tileData.size
                tile.logo = tileData.logo
                tile.inverted = tileData.inverted
                tile.state = tileData.state
            })
            // remakes the canvas to the connrect size
            grid.createCanvas()
            redraw()
        }
        // if there was a file droped it is loaded else the server file is used
        if (file) {
            if (file.subtype == 'json') {
                loadJSON(file.data,data => {loadData(this,data)})
            }
        } else {
            loadJSON('nodeMap.json',data => {loadData(this,data)})
        }
    }
    // saves the grid as a json file
    export() {
        const json = {}
        // saves the grid size and grid as a list
        json.size = [this.sizex,this.sizey]
        json.grid = []
        this._grid.forEach(ycol => {
            ycol.forEach(tile => {
                if (tile.size[0] != 0 && tile.size[1] != 0) {
                    // saves only the nessary details to the file; emtpy tiles are ingroned
                    json.grid.push({
                        position:tile.position,
                        size:tile.size,
                        logo:tile.logo,
                        inverted:tile.inverted,
                        state:tile.state
                    })
                }
            })
        })
        saveJSON(json,'nodeMap.json',true)
    }
}

class Tile{
    constructor(grid,x,y,sx,sy) {
        this.grid = grid
        this.position = [x,y]
        this._size = [sx,sy]
        this._logo = 0
        this._inverted = false
        this._state = 0
        this._redirect = false
        this._redirectSign = false
        this._cache = false
    }
    // compeares two cordinates and returns a direction: clockwise from north 0,1,2,3
    static direction(tileOne,tileTwo) {
        const dx = tileTwo.posx-tileOne.posx
        const dy = tileTwo.posy-tileOne.posy
        if (dx == 0) {
            if (dy > 0) return 2
            else return 0
        } else if (dy == 0) {
            if (dx > 0) return 1
            else return 3
        } else return 0
    }
    // this will make all adjacent tiles be redrawen
    get cache() {return this._cache}
    set cache(value) {
        this._cache = value
        if (!value) {
            const adjacent = grid.getAdjacent(this)
            adjacent.forEach(tile => {tile._cache = false;if (tile.redirect) tile.redirect._cache = false})
        }
    }
    // these are all just to make the tile be redrawen
    get logo() {return this._logo}
    set logo(value) {
        if (this.size[0]*this.size[1] != 4) this._logo = 0
        else this._logo = value
        this.cache = false
    }
    get inverted() {return this._inverted}
    set inverted(value) {
        if (this.size[0]*this.size[1] == 0 || this.state < Connections[connectionFirstTimer][0]) this._inverted = false
        else this._inverted = value
        this.cache = false
    }
    get state() {return this._state}
    set state(value) {
        if (this.size[0]*this.size[1] == 0) this._state = 0
        else this._state = value
        this.cache = false
    }
    // when size is set it updates the tiles around it
    get size() {return this._size}
    set size(value) {
        const [x,y] = value
        this.grid.setRedirects(this,true)
        this._size = [x,y]
        this.cache = false
        this.inverted = false
        this.state = 0
        this.logo = 0
        if (!this.grid.setRedirects(this)) this._size = [0,0]
    }
    // easy access to the cord of the tile
    get posx() {return this.position[0]}
    get posy() {return this.position[1]}
    // redirects are for tiles bigger than 1x1
    get redirect() {if (this._redirect) {return this._redirect} else return this}
    set redirect(tile) {
        this.size = [0,0]
        this._state = 0
        this._inverted = false
        this.cache = false
        this._redirect = tile
        if (tile) this._redirectSign = tile.size[0]+','+tile.size[1]
    }
    // this creates a buffer to be drawen
    createBuffer() {
        const [sizex,sizey] = this.size
        // creats a graphic buffer for the tile
        this.cache = createGraphics(tileSize*sizex,tileSize*sizey)
        if (sizex == 0 || sizey == 0) return
        // finds the correct sprtie sheet for this tile
        let tile = false
        Tiles.forEach(type => {
            if (type && type[0] == sizex && type[1] == sizey) tile = type[2]
        })
        if (this.logo > 0 && Logos[this.logo]) tile = Logos[this.logo]
        if (!tile) return
        // finds the location of the sprite on the sprite sheet
        let [sy, sx] = [0, 0]
        if (verticalSprites) {sy = this.state*tileSize*sizey;if (this.inverted) sx = tileSize*sizex}
        else {sx = this.state*tileSize*sizex;if (this.inverted) sy = tileSize*sizey}
        // addes the base sprite to the graphic buffer
        console.log(`tile: (${this.position}), type: {state:${this.state}, size:${this.size[0]}x${this.size[1]}, logo:${this.logo}}, pullFrom: {sx:${sx}, sy:${sy}, sizex:${tileSize*sizex}, sizey:${tileSize*sizey}}`)
        this.cache.image(tile,0,0,tileSize*sizex,tileSize*sizey,sx,sy,tileSize*sizex,tileSize*sizey)
        // draws the connections for this tile
        if (this.state < Connections[connectionFirstOffline][0]) return
        const adjacent = grid.getAdjacent(this,true)
        adjacent.forEach(cord => {
            let source = cord[0]
            let tile = cord[1]
            if (tile.redirect) tile = tile.redirect
            // this logic finds the type of connection that should be used, if it is 0 then it is not drawen
            let connectionSelf = -1
            let connectionTarget = -1
            for (let i = 0; i < Connections.length; i++) {
                if (connectionSelf < 0 && this.state <= Connections[i][1]) connectionSelf=i
                if (connectionTarget < 0 && tile.state <= Connections[i][1]) connectionTarget=i
                if (connectionSelf >= 0 && connectionTarget >= 0) break
            }
            if (!Connections[connectionSelf]) return
            if (connectionSelf <= 0 || connectionTarget <= 0) return
            let sprite = Connections[connectionSelf][2][connectionTarget-1]
            let offset = 4
            if (connectionSelf > connectionTarget) {
                sprite = Connections[connectionTarget][2][connectionSelf-1]
                offset = 0
            } else if (connectionSelf == connectionTarget) offset = 0
            // finds the loction on the sprite sheet
            let direction = Tile.direction(grid.getTile(source[0],source[1]),cord[1])
            let [sY, sX] = [0, 0]
            if (verticalSprites) sY = (direction+offset)*tileSize
            else sX = (direction+offset)*tileSize
            // adds the connection to the graphic buffer
            console.log(`connection: (${source[0]},${source[1]}) > (${cord[1].posx},${cord[1].posy}), type: ${connectionSelf} > ${connectionTarget}, dirrection: ${direction}, drawTo: (${source[0]-this.posx},${source[1]-this.posy}), pullFrom: {sx:${sx}, sy:${sy}, sizex:${tileSize}, sizey:${tileSize}}`)
            this.cache.image(sprite,tileSize*(source[0]-this.posx),tileSize*(source[1]-this.posy),tileSize,tileSize,sX,sY,tileSize,tileSize)
        })
    }
    // draws the tile to the canvas
    draw() {
        if (!this.cache) this.createBuffer()
        const [x,y] = this.position
        const [sx,sy] = this.size
        const displayerSize = tileSize*scaleFactor
        if (sx == 0 || sy == 0) return
        image(this.cache,displayerSize*x,displayerSize*y,displayerSize*sx,displayerSize*sy)
    }
}

const grid = new Grid(15,15) // 15 is just a default

// preloads the sprite sheets
function preload() {
    // loads the tile sprite sheets
    for (let i = 0; i < Tiles.length; i++) {
        if (Tiles[i] && Tiles[i][2]) {
            console.log(`Loaded sprites for: ${Tiles[i][2]}`)
            Tiles[i][2] = loadImage(assetsPath+Tiles[i][2]+'.png')
        }
    }
    // loads the logo tile sprite sheets
    for (let i = 0; i < Logos.length; i++) {
        if (Logos[i]) {
            console.log(`Loaded sprites for: ${Logos[i]}`)
            Logos[i] = loadImage(assetsPath+Logos[i]+'.png')
        }
    }
    // loads the connection sprite sheets
    for (let i = 0; i < Connections.length; i++) {
        if (Connections[i] && Connections[i][2]) {
            console.log(`Loaded sprites for: ${Connections[i][2]}`)
            Connections[i][2] = Connections[i][2].map(value => loadImage(assetsPath+value+'.png'))
        }
    }
}

// set up for the display, makes it a still imange, creates a canvas, disables smoothing
function setup() {
    noLoop()
    grid.createCanvas()
}

// draws every tile on the grid
function draw() {
    console.log(grid)
    // if it is view mode then it is black, else it is grey
    if (viewMode) background(0,0,0)
    else background(100,100,100)
    // loops over every tile
    for (let y = 0; y < grid.sizey; y++) {
        for (let x = 0; x < grid.sizex; x++) {
            grid.getTile(x,y).draw()
        }
    }
}

/*
w increase timmer
s decrease timmer

i import grid from nodeMap.json
o export grid to nodeMap.json
p print the image to file nodeMap.png
q toggle view mode

1-4 build tile
e remove tile
r set online
*/
function keyTyped() {
    // disable input in view mode
    if (viewMode && key != 'q' && key != 'p') return
    // gets the mouse position
    let tileX = Math.floor(mouseX/(tileSize*scaleFactor))
    if (tileX >= grid.sizex) return
    let tileY = Math.floor(mouseY/(tileSize*scaleFactor))
    if (tileY >= grid.sizey) return
    console.log(`press: (${tileX},${tileY})`)
    // redirects the location if selected tile is a redirect
    let tile = grid.getTile(tileX,tileY)
    if (tile.redirect) {
        tileX = tile.redirect.posx
        tileY = tile.redirect.posy
        tile = tile.redirect
    }
    // key logic, see above
    switch (key) {
        case 'w': {
            if (tile.state <= Connections[connectionFirstOffline][1]) tile.state = Connections[connectionFirstTimer][0]
            else tile.state++
        } break 
        case 's': {
            if (tile.state > Connections[connectionFirstTimer][0]) tile.state--
            else if (tile.state == Connections[connectionFirstTimer][0]) tile.state=0
        } break
        case 'a': if (tile.logo > 0) tile.logo--; break
        case 'd': if (tile.logo < Logos.length) tile.logo++; break
        case 'f': tile.inverted = !tile.inverted; break
		case 'r': tile.size = [0,0]; break
        case '1': tile.size = [1,1]; break
        case '2': tile.size = [2,1]; break
        case '3': tile.size = [1,2]; break
        case '4': tile.size = [2,2]; break
        case 'v': tile.size = [tile.size[1],tile.size[0]]; break
        case 'p': save('nodeMap.png'); break
        case 'i': grid.import(); break
        case 'o': grid.export(); break
        case 'e': if (tile.state == Connections[connectionFirstOnline][0]) {tile.state=0;tile.inverted=false} else tile.state=Connections[connectionFirstOnline][0];break
        case 'q': {
            viewMode = !viewMode
            for (let y = 0; y < grid.sizey; y++) {
                for (let x = 0; x < grid.sizex; x++) {
                    const done = []
                    // in view mode gradents are set, else there are removed
                    if (viewMode) {if (grid.getTile(x,y).state >= Connections[connectionFirstTimer][0]) grid.setStates(grid.getTile(x,y),done)}
                    else {if (grid.getTile(x,y).state <= Connections[connectionFirstOffline][1]) grid.getTile(x,y).state = 0}
                }
            }
        } break
    }
    // redraws the gird
    redraw()
}