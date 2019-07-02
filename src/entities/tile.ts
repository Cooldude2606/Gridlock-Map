import p5 = require("p5");
import { Grid } from "./grid";
import { TileAsset } from "./asset";
import { renderSettings, tileToPixel } from "../public/config";
import { Position, Size, Direction } from "../lib/defines";
import { log } from "../lib/log";

export class Redirect {

    position: Position
    delta: Position
    tile: Tile

    constructor(position: Position, tile: Tile) {
        this.position = position
        this.tile = tile
        this.delta = {
            x: position.x-tile.position.x,
            y: position.y-tile.position.y
        }
    }

    updateTileBuffer(grid: Grid) {
        const tile = this.tile

        for (let direction = Direction.up; direction <= Direction.left; direction++) {
            const targetTile = grid.getTileDirection(this.position,direction)
            if (targetTile && targetTile !== this.tile) {
                tile.asset.drawConnection(tile.buffer,direction,tile.progress,targetTile.progress,this.delta)
            }
        }
    }

}

export class Tile {

    size: Size
    position: Position
    asset: TileAsset
    redirects: Array<Redirect>
    buffer: p5.Graphics|any
    progress: number
    logo: string
    inverted: boolean

    constructor(position: Position, size: Size, logo?: string) {
        this.position = position
        this.size = size
        const ran = Math.random()
        if (ran < 0.95) this.progress = 0; else
        if (ran < 0.98) this.progress = 8
        else this.progress = 18
        this.logo = logo
        this.inverted = false
        this.redirects = []
        this.asset = new TileAsset(size,logo)
    }

    newBuffer(sketch: p5, grid: Grid ) {
        const size = tileToPixel(this.size)
        if (this.buffer) this.buffer.remove()
        this.buffer = sketch.createGraphics(size.x,size.y)

        const context = this.buffer.elt.getContext('2d');
        context.imageSmoothingEnabled = false;

        log.debug(`Rendered tile: {x:${this.position.x},y:${this.position.y},p:${this.progress},i:${this.inverted}}`)
        this.asset.drawTile(this.buffer,this.progress,this.inverted)

        for (let direction = Direction.up; direction <= Direction.left; direction++) {
            const targetTile = grid.getTileDirection(this.position,direction)
            if (targetTile && targetTile !== this) {
                log.debug(`Rendered connection: {x:${this.position.x},y:${this.position.y},d:${Direction[direction]},sp:${this.progress},tp:${targetTile.progress}}`)
                this.asset.drawConnection(this.buffer,direction,this.progress,targetTile.progress)
            }
        }

        this.redirects.forEach(redirect => {
            redirect.updateTileBuffer(grid)
        })
    }

    draw(sketch: p5, grid: Grid) {
        if (!this.buffer) this.newBuffer(sketch,grid)

        const positionPixel = tileToPixel(this.position)
        grid.buffer.image(this.buffer,positionPixel.x,positionPixel.y)
    }

}