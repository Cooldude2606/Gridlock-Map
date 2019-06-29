import { SpriteSheet, Size, ImageBuffer, Range } from '../lib/defines'
import { renderSettings } from "../public/config";
import { log } from '../lib/log';
import p5 = require('p5');

const spriteSheets: Array<SpriteSheet> = []

export function newTileSpriteSheet(image: p5.Image, asset: { x: number, y: number, file: string}, logo?: string): void {
    log.info(`Loaded sprite sheet from: ${asset.file}`)
    spriteSheets.push({
        image: image,
        tileSize: {
            x: asset.x,
            y: asset.y,
        },
        assetSize: {
            x: asset.x*renderSettings.tileSize.x,
            y: asset.y*renderSettings.tileSize.y,
        },
        logo: logo
    })
}

export class TileAsset {

    size: Size
    spriteSheet: SpriteSheet

    constructor(size: Size, logo?: string) {
        this.size = size
        this.spriteSheet = spriteSheets.find(spriteSheet => {
            if (spriteSheet.tileSize.x == size.x && spriteSheet.tileSize.y == size.y) {
                return spriteSheet
            }
        })
    }

    draw(buffer: ImageBuffer, progress: number, inverted: boolean = false) {
        const assetSize = this.spriteSheet.assetSize
        const sx = assetSize.x*progress
        const sy = inverted ? assetSize.y : 0
        buffer.image(this.spriteSheet.image,0,0,assetSize.x,assetSize.y,sx,sy,assetSize.x,assetSize.y)
    }

}

export class ConnectionAsset {

    range: Range
    spritSheet: SpriteSheet

}