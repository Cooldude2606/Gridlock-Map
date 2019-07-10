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
        const renderRequirement = renderSettings.allowSelectionAtProgress

        for (let direction = Direction.up; direction <= Direction.left; direction++) {
            const targetTile = grid.getTileDirection(this.position,direction)
            if (targetTile && targetTile !== this.tile) {
                if (tile.area && (tile.area != targetTile.area || targetTile.progress < renderRequirement) && tile.progress >= renderRequirement) {
                    log.debug(`Rendered area bound: {x:${this.position.x},y:${this.position.y},d:${Direction[direction]},sa:${tile.area},ta:${targetTile.area}}`)
                    tile.asset.drawAreaBound(tile.buffer,direction,tile.area,this.delta)
                }
                log.debug(`Rendered connection: {x:${this.position.x},y:${this.position.y},d:${Direction[direction]},sp:${tile.progress},tp:${targetTile.progress}}`)
                tile.asset.drawConnection(tile.buffer,direction,tile.progress,targetTile.progress,this.delta)
            } else if (!targetTile && tile.area && tile.progress >= renderRequirement) {
                log.debug(`Rendered area bound: {x:${this.position.x},y:${this.position.y},d:${Direction[direction]},sa:${tile.area},ta:Null}`)
                tile.asset.drawAreaBound(tile.buffer,direction,tile.area,this.delta)
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
    inverted: boolean
    logo: string
    name: string
    area: string

    constructor(position: Position, size: Size, logo?: string) {
        logo = logo == '' ? undefined : logo
        this.position = position
        this.size = size
        this.asset = new TileAsset(size,logo)
        this.redirects = []
        this.progress = -1
        this.inverted = false
        this.logo = logo
        this.name = `X: ${position.x} Y: ${position.y}`
    }

    newBuffer(sketch: p5, grid: Grid ) {
        const size = tileToPixel(this.size)
        if (this.buffer) this.buffer.remove()
        this.buffer = sketch.createGraphics(size.x,size.y)

        const context = this.buffer.elt.getContext('2d');
        context.imageSmoothingEnabled = false;

        log.debug(`Rendered tile: {x:${this.position.x},y:${this.position.y},p:${this.progress},i:${this.inverted}}`)
        this.asset.drawTile(this.buffer,this.progress,this.inverted)

        const renderRequirement = renderSettings.allowSelectionAtProgress
        for (let direction = Direction.up; direction <= Direction.left; direction++) {
            const targetTile = grid.getTileDirection(this.position,direction)

            if (targetTile && targetTile !== this) {
                if (this.area && (this.area != targetTile.area || targetTile.progress < renderRequirement) && this.progress >= renderRequirement) {
                    log.debug(`Rendered area bound: {x:${this.position.x},y:${this.position.y},d:${Direction[direction]},sa:${this.area},ta:${targetTile.area}}`)
                    this.asset.drawAreaBound(this.buffer,direction,this.area)
                }
                log.debug(`Rendered connection: {x:${this.position.x},y:${this.position.y},d:${Direction[direction]},sp:${this.progress},tp:${targetTile.progress}}`)
                this.asset.drawConnection(this.buffer,direction,this.progress,targetTile.progress)
            } else if (!targetTile && this.area && this.progress >= renderRequirement) {
                log.debug(`Rendered area bound: {x:${this.position.x},y:${this.position.y},d:${Direction[direction]},sa:${this.area},ta:Null}`)
                this.asset.drawAreaBound(this.buffer,direction,this.area)
            }

        }

        this.redirects.forEach(redirect => {
            redirect.updateTileBuffer(grid)
        })
    }

    draw(sketch: p5, grid: Grid) {
        if (!this.buffer) this.newBuffer(sketch,grid)

        const topLeft = tileToPixel(grid.area.topLeft)
        const positionPixel = tileToPixel(this.position)
        grid.buffer.image(this.buffer,positionPixel.x-topLeft.x,positionPixel.y-topLeft.y)
    }

}