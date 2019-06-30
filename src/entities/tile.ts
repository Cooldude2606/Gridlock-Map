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
        switch (Math.round(Math.random()*2)) {
            case 0: this.progress = 7; break
            case 1: this.progress = 8; break
            case 2: this.progress = 17; break
        }
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