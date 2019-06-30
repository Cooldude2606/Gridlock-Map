import { Tile, Redirect } from "./tile";
import { Size, Position, Direction, TileImport } from "../lib/defines";
import p5 = require("p5");
import { log } from "../lib/log";
import { progressCalculations, renderSettings } from "../public/config";

export class Grid {

    tiles: Array<Tile|Redirect>

    constructor() {
        this.tiles = []
    }

    get size(): Size {
        const size: Size = {x:0,y:0}
        const tileCount = this.tiles.length
        for (let tileIndex = 0; tileIndex < tileCount; tileIndex++) {
            const tile = this.tiles[tileIndex]
            if (size.x < tile.position.x) {
                size.x = tile.position.x
            }
            if (size.y < tile.position.y) {
                size.y = tile.position.y
            }
        }
        return size
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

            if (queue.indexOf(tile) >= currentIndex) {
                const adjacent = this.getAdjacentTiles(tile.position)
                let newProgress = tile.progress

                adjacent.forEach(adjacentTile => {
                    queue.push(adjacentTile)
                    const calc = progressCalculations.find(calcs => {
                        return adjacentTile.progress >= calcs.min && adjacentTile.progress <= calcs.max
                    })
                    const rtn = calc.rtn(adjacentTile.progress)
                    if (newProgress < rtn)  newProgress = rtn
                })

                tile.progress = newProgress < 0 ? 0 : newProgress
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
        const size = this.size
        const scale = renderSettings.scale
        const tileSize = renderSettings.tileSize
        sketch.resizeCanvas(size.x*scale*tileSize.x,size.y*scale*tileSize.y)
        sketch.save('gridlock-map.png')
        sketch.resizeCanvas(sketch.windowWidth,sketch.windowHeight)
    }

    draw(sketch: p5): void {
        this.tiles.forEach(tile => {
            if (tile instanceof Tile && tile.progress > 0) this.calculateProgress(tile)
        })

        this.tiles.forEach(tile => {
            tile.draw(sketch,this)
        })
    }

}