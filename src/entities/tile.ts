import { Position, Size, Direction } from "../lib/defines";
import { TileAsset } from "./asset";
import p5 = require("p5");
import { renderSettings } from "../public/config";
import { Grid } from "./grid";

export class Redirect {

    position: Position
    tile: Tile

    constructor(position: Position, tile: Tile) {
        this.position = position
        this.tile = tile
    }

    draw(buffer: p5, grid: Grid) {
        const px = this.position.x*renderSettings.tileSize.x*renderSettings.scale
        const py = this.position.y*renderSettings.tileSize.y*renderSettings.scale
        for (let direction = Direction.up; direction <= Direction.left; direction++) {
            const targetTile = grid.getTileDirection(this.position,direction)
            if (targetTile && targetTile !== this.tile) {
                this.tile.asset.drawConnection(buffer,{x:px,y:py},direction,this.tile.progress,targetTile.progress)
            }
        }
    }

}

export class Tile {

    size: Size
    position: Position
    asset: TileAsset
    redirects: Array<Redirect>
    progress: number
    logo: string
    inverted: boolean

    constructor(position: Position, size: Size, logo?: string) {
        this.position = position
        this.size = size
        const ran = Math.random()
        if (ran < 0.95) this.progress = 0; else
        if (ran < 0.98) this.progress = 8
        else this.progress = 17
        this.logo = logo
        this.inverted = false
        this.redirects = []
        this.asset = new TileAsset(size,logo)
    }

    draw(buffer: p5, grid: Grid) {
        const px = this.position.x*renderSettings.tileSize.x*renderSettings.scale
        const py = this.position.y*renderSettings.tileSize.y*renderSettings.scale
        this.asset.drawTile(buffer,{x:px,y:py},this.progress,this.inverted)
        for (let direction = Direction.up; direction <= Direction.left; direction++) {
            const targetTile = grid.getTileDirection(this.position,direction)
            if (targetTile && targetTile !== this) {
                this.asset.drawConnection(buffer,{x:px,y:py},direction,this.progress,targetTile.progress)
            }
        }
    }

}