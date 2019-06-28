const Jimp = require('jimp')
const config = require('./config')
// graphic settings
const scaleFactor = config.graphic.scaleFactor // scale finnal image up by this ammount
const tileSize = config.graphic.tileSize // size of each tile on the sprite sheet
const verticalSprites = config.graphic.verticalSprites // the direction of the sprites
const assetsPath = config.graphic.assetsPath // path to assets

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
        // new one is made and drop event and parent are set up
        this.canvas = new Jimp(tileSize*this.sizex*scaleFactor, tileSize*this.sizey*scaleFactor)
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
            if (sY ==  sizey-1) addAdjacent(this,x+sX,y+sY,x+sX,y+sY+1)
            if (sX == 0) addAdjacent(this,x+sX,y+sY,x+sX-1,y+sY)
            if (sX ==  sizex-1) addAdjacent(this,x+sX,y+sY,x+sX+1,y+sY)
            // increment x in a way to only include the eages
            if (sY == 0 || sY ==  sizey-1) sX++
            else sX =  sizex-1
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
    import(json) {
        // remakes an empty grid
        this.sizex=json.size[0]
        this.sizey=json.size[1]
        this._grid = Array.apply(null,Array(json.size[1])).map((n,oy) => Array.apply(null,Array(json.size[0])).map((n,ox) => new Tile(this,ox,oy,0,0)))
        // fills in all the values for the new grid
        json.grid.forEach(tileData => {
            let tile = this.getTile(tileData.position[0],tileData.position[1])
            tile.size = tileData.size
            tile.logo = tileData.logo
            tile.inverted = tileData.inverted
            tile.state = tileData.state
        })
        // remakes the canvas to the connrect size
        this.createCanvas()
        this.draw()
    }
    export() {
        return this.canvas.getBufferAsync(Jimp.MIME_PNG)
    }
    draw() {
        for (let y = 0; y < this.sizey; y++) {
            for (let x = 0; x < this.sizex; x++) {
                const done = []
                if (this.getTile(x,y).state >= Connections[connectionFirstTimer][0]) this.setStates(this.getTile(x,y),done)
            }
        }
        for (let y = 0; y < this.sizey; y++) {
            for (let x = 0; x < this.sizex; x++) {
                this.getTile(x,y).draw()
            }
        }
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
            const adjacent = this.grid.getAdjacent(this)
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
        this.cache = tile.clone()
        this.cache.crop(sx,sy,tileSize*sizex,tileSize*sizey)
        // draws the connections for this tile
        if (this.state < Connections[connectionFirstOffline][0]) return
        const adjacent = this.grid.getAdjacent(this,true)
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
            let direction = Tile.direction(this.grid.getTile(source[0],source[1]),cord[1])
            let [sY, sX] = [0, 0]
            if (verticalSprites) sY = (direction+offset)*tileSize
            else sX = (direction+offset)*tileSize
            // adds the connection to the graphic buffer
            console.log(`connection: (${source[0]},${source[1]}) > (${cord[1].posx},${cord[1].posy}), type: ${connectionSelf} > ${connectionTarget}, dirrection: ${direction}, drawTo: (${source[0]-this.posx},${source[1]-this.posy}), pullFrom: {sx:${sx}, sy:${sy}, sizex:${tileSize}, sizey:${tileSize}}`)
            let clone = sprite.clone()
            clone.crop(sX,sY,tileSize,tileSize)
            this.cache.composite(clone,tileSize*(source[0]-this.posx),tileSize*(source[1]-this.posy))
        })
    }
    // draws the tile to the canvas
    draw() {
        if (!this.cache) this.createBuffer()
        const [x,y] = this.position
        const [sx,sy] = this.size
        const displayerSize = tileSize*scaleFactor
        if (sx == 0 || sy == 0) return
        this.cache.scaleToFit(displayerSize*sx,displayerSize*sy)
        this.grid.canvas.blit(this.cache,displayerSize*x,displayerSize*y)
    }
}

// preloads the sprite sheets
function preload() {
    let waiting = 0
    let errors = 0
    // loads the tile sprite sheets
    for (let i = 0; i < Tiles.length; i++) {
        if (Tiles[i] && Tiles[i][2]) {
            waiting++
            console.log(`Loaded sprites for: ${Tiles[i][2]}`)
            Jimp.read(__dirname+'/'+assetsPath+Tiles[i][2]+'.png').then(image => {
                Tiles[i][2] = image
                waiting--
            }).catch(err => {
                errors++
                waiting--
                console.log(err)
            })
        }
    }
    // loads the logo tile sprite sheets
    for (let i = 0; i < Logos.length; i++) {
        if (Logos[i]) {
            waiting++
            console.log(`Loaded sprites for: ${Logos[i]}`)
            Jimp.read(__dirname+'/'+assetsPath+Logos[i]+'.png').then(image => {
                Logos[i] = image
                waiting--
            }).catch(err => {
                errors++
                waiting--
                console.log(err)
            })
        }
    }
    // loads the connection sprite sheets
    for (let i = 0; i < Connections.length; i++) {
        if (Connections[i] && Connections[i][2]) {
            waiting += Connections[i][2].length
            console.log(`Loaded sprites for: ${Connections[i][2]}`)
            Connections[i][2].forEach((value,n) => Jimp.read(__dirname+'/'+assetsPath+value+'.png').then(image => {
                Connections[i][2][n] = image
                waiting--
            }).catch(err => {
                errors++
                waiting--
                console.log(err)
            }))
        }
    }
    return new Promise((resolve,reject) => {
        function check() {
            console.log('Waiting on: '+waiting)
            if (errors > 0) reject('There was an error')
            if (waiting > 0) setTimeout(check,10)
            else resolve()
        }
        check()
    })
}

module.exports = {
    grid: new Grid(15,15),
    preload: preload
}