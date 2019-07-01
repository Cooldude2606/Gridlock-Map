import p5 = require("p5");
import { log } from "../lib/log";
import { Tile, Redirect } from "./tile";
import { Size, Position, Direction, TileImport, Area } from "../lib/defines";
import { progressCalculations, renderSettings, tileToPixel } from "../public/config";

export class Grid {

    tiles: Array<Tile|Redirect>
    buffer: p5.Graphics|any

    constructor() {
        this.tiles = []
    }

    get area(): Area {
        const area: Area = {topLeft:{x:0,y:0},bottomRight:{x:0,y:0}}
        this.tiles.forEach(tile => {
            const pos = tile.position
            if (pos.x < area.topLeft.x) area.topLeft.x = pos.x
            if (pos.x > area.bottomRight.x) area.bottomRight.x = pos.x
            if (pos.y < area.topLeft.y) area.topLeft.y = pos.y
            if (pos.y > area.bottomRight.y) area.bottomRight.y = pos.y
        })
        return area
    }

    get size(): Size {
        const area = this.area
        return {
            x: area.bottomRight.x-area.topLeft.x,
            y: area.bottomRight.y-area.topLeft.y
        }
    }

    getTile(position: Position): Tile {
        const tile = this.tiles.find(tile => {
            return position.x == tile.position.x && position.y == tile.position.y
        })
        return tile instanceof Redirect ? tile.tile : tile
    }
    
    getTileDirection(position: Position, direction: Direction) {
        switch (direction) {
            case Direction.up: {
                return this.getTile({x: position.x, y: position.y-1})
            }
            case Direction.right: {
                return this.getTile({x: position.x+1, y: position.y})
            }
            case Direction.down: {
                return this.getTile({x: position.x, y: position.y+1})
            }
            case Direction.left: {
                return this.getTile({x: position.x-1, y: position.y})
            }
        }
    }

    // gets an array of all the tiles that are around this tile
    getAdjacentTiles(position: Position): Array<Tile> {
        const tile = this.getTile(position)
        const adjacent: Array<Tile> = []
        position = tile.position

        function tileExists(grid: Grid, adjacent: Array<Tile>, x: number, y: number) {
            const adjacentTile = grid.getTile({x:x,y:y})
            if (adjacentTile) adjacent.push(adjacentTile)
        }

        for (let sx = 0; sx < tile.size.x; sx++) {
            tileExists(this,adjacent,position.x+sx,position.y-1)
            tileExists(this,adjacent,position.x+sx,position.y+tile.size.y)
        }

        for (let sy = 0; sy < tile.size.y; sy++) {
            tileExists(this,adjacent,position.x-1,position.y+sy)
            tileExists(this,adjacent,position.x+tile.size.x,position.y+sy)
        }

        return adjacent
    }

    // makes a tile that redirects to a different one
    newRedirect(position: Position, tile: Tile): void {
        const redirect = new Redirect(position,tile)
        tile.redirects.push(redirect)
        this.tiles.push(redirect)
    }

    // makes a new tile at this postion, adds redirects where needed
    newTile(position: Position, size: Size, logo?: string): Tile {
        const tile = new Tile(position,size,logo)
        this.tiles.push(tile)
        for (let sx = 0; sx < size.x; sx++) {
            for (let sy = 0; sy < size.y; sy++) {
                if (!(sx == 0 && sy == 0)) {
                    this.newRedirect({
                        x: position.x + sx,
                        y: position.y + sy
                    },tile)
                }
            }
        }
        return tile
    }

    calculateProgress(startTile: Tile) {
        const queue: Array<Tile> = [startTile]

        for (let currentIndex = 0; currentIndex < queue.length; currentIndex++) {
            const tile = queue[currentIndex]
            const adjacent = this.getAdjacentTiles(tile.position)
            let newProgress = tile.progress

            adjacent.forEach(adjacentTile => {
                const calc = progressCalculations.find(calcs => {
                    return adjacentTile.progress >= calcs.min && adjacentTile.progress <= calcs.max
                })
                const rtn = calc.rtn(adjacentTile.progress)
                if (newProgress < rtn)  newProgress = rtn
            })

            tile.progress = newProgress < 0 ? 0 : newProgress
            if (tile.progress > 0) {
                adjacent.forEach(adjacentTile => {
                    if (!queue.includes(adjacentTile)) queue.push(adjacentTile)
                })
            }

        }

    }

    load(data: Array<TileImport>): void {
        log.debug('Loading new map data')
        this.tiles = []
        data.forEach(tileData => {
            const tile = this.newTile(tileData.position,tileData.size,tileData.logo)
            tile.progress = tileData.progress || 0
            tile.inverted = tileData.inverted || false
        })
    }

    export(sketch: p5): void {
        const size = tileToPixel(this.size)
        sketch.resizeCanvas(size.x,size.y)
        sketch.save('gridlock-map.png')
        sketch.resizeCanvas(sketch.windowWidth,sketch.windowHeight)
    }

    newBuffer(sketch: p5, scale: number = renderSettings.scale): void {
        const size = tileToPixel(this.size)
        this.buffer = sketch.createGraphics(size.x*scale,size.y*scale)
        this.buffer.scale(scale)

        const context = this.buffer.elt.getContext('2d');
        context.imageSmoothingEnabled = false;

        this.tiles.forEach(tile => {
            if (tile instanceof Tile && tile.progress > 0) this.calculateProgress(tile)
        })

        this.tiles.forEach(tile => {
            tile.draw(this.buffer,this)
        })

    }

    draw(sketch: p5, position: Position): void {
        if (!this.buffer) this.newBuffer(sketch)

        const size = tileToPixel(this.size)
        sketch.image(this.buffer,position.x-size.x,position.y-size.y)
    }

}