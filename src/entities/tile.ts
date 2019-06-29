import { Position, Size, ImageBuffer } from "../lib/defines";
import { TileAsset, ConnectionAsset } from "./asset";
import p5 = require("p5");
import { renderSettings } from "../public/config";

export class Redirect {

    position: Position
    tile: Tile

    constructor(position: Position, tile: Tile) {
        this.position = position
        this.tile = tile
    }

}

export class Tile {

    size: Size
    position: Position
    asset: TileAsset
    connections: ConnectionAsset
    redirects: Array<Redirect>
    progress: number
    logo: string
    inverted: boolean

    constructor(position: Position, size: Size, logo?: string) {
        this.position = position
        this.size = size
        this.progress = 17
        this.logo = logo
        this.inverted = false
        this.asset = new TileAsset(size,logo)
    }

    draw(buffer: p5) {
        const tileBuffer = buffer.createGraphics(renderSettings.tileSize.x*this.size.x,renderSettings.tileSize.y*this.size.y)
        this.asset.draw(tileBuffer,this.progress,this.inverted)
        const sx = renderSettings.tileSize.x*renderSettings.scale
        const sy = renderSettings.tileSize.y*renderSettings.scale
        const px = this.position.x*sx
        const py = this.position.y*sy
        buffer.image(tileBuffer,px,py,sx,sy)
    }

}