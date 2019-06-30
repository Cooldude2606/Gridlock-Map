import { Tile, Redirect } from "./tile";
import { Size, Position, Direction } from "../lib/defines";
import p5 = require("p5");
import { log } from "../lib/log";

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

        function tileExists(grid: Grid, adjacent: Array<Tile>, position: Position) {
            const adjacentTile = grid.getTile(position)
            if (adjacentTile) adjacent.push(adjacentTile)
        }

        for (let sx = 0; sx < tile.size.x; sx++) {
            tileExists(this,adjacent,{x: position.x+sx, y: position.y-1})
            tileExists(this,adjacent,{x: position.x+sx, y: position.y+tile.size.y})
        }

        for (let sy = 0; sy < tile.size.y; sy++) {
            tileExists(this,adjacent,{x: position.x-1, y: position.y+sy})
            tileExists(this,adjacent,{x: position.x+tile.size.x, y: position.y+sy})
        }

        return adjacent
    }

    // removes a single tile, no redirect
    removeTileRaw(position: Position): void {
        const tileCount = this.tiles.length
        for (let tileIndex = 0; tileIndex < tileCount; tileIndex++) {
            const tile = this.tiles[tileIndex]
            if (tile.position.x == position.x && tile.position.y == position.y) {
                this.tiles.splice(tileIndex,1)
                break
            }
        }
    }

    // removes a tile and all tiles that redirect to it
    removeTile(position: Position): void {
        const tile = this.getTile(position)
        this.removeTileRaw(position)
        tile.redirects.forEach(redirect => {
            this.removeTileRaw(redirect.position)
        })
    }

    // checks if an area is clear
    areaClear(position: Position, size: Size): boolean {
        for (let sx = 0; sx < size.x; sx++) {
            for (let sy = 0; sy < size.y; sy++) {
                if (sx != 0 && sy != 0) {
                    const tile = this.getTile({
                        x: position.x + sx,
                        y: position.y + sy
                    })
                    if (tile) return false
                }
            }
        }
        return true
    }

    // makes a tile that redirects to a different one
    newRedirect(position: Position, tile: Tile): void {
        const redirect = new Redirect(position,tile)
        tile.redirects.push(redirect)
        this.tiles.push(redirect)
    }

    // makes a new tile at this postion, adds redirects where needed
    newTile(position: Position, size: Size): void {
        const tile = new Tile(position,size)
        this.tiles.push(tile)
        for (let sx = 0; sx < size.x; sx++) {
            for (let sy = 0; sy < size.y; sy++) {
                if (sx != 0 && sy != 0) {
                    this.newRedirect({
                        x: position.x + sx,
                        y: position.y + sy
                    },tile)
                }
            }
        }
    }

    draw(buffer: p5): void {
        this.tiles.forEach(tile => {
            tile.draw(buffer,this)
        })
    }

}