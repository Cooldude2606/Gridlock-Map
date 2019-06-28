import { Size, SpriteSheet } from "../lib/defines";
import { config } from "../config";
import { debugLog } from "../lib/log";

const tileAssets: Array<SpriteSheet> = []

export function newBaseAsset(base: SpriteSheet) {
    tileAssets.push(base)
}

export class Asset {

    size: Size
    logo: string
    progress: number
    inverted: boolean
    buffer: p5.Graphics|any // any to remove error
    spriteSheet: SpriteSheet

    constructor(size: Size,logo: string) {
        this.size = size
        this.logo = logo
        this.progress = 0
        const scale = config.renderSettings.scale
        this.buffer = createGraphics(size.x*scale,size.y*scale)
        for (let assetIndex = 0; assetIndex < tileAssets.length; assetIndex++) {
            const spriteSheet = tileAssets[assetIndex]
            if (spriteSheet.x == size.x && spriteSheet.y == size.y) {
                if (logo == spriteSheet.logo) {
                    this.spriteSheet = spriteSheet
                    break
                }
            }
        }
    }

    update(): void {
        debugLog('Updated asset for {{x},{y}}',this.size)
        const tileSize = config.renderSettings.size
        const sizeX = tileSize*this.spriteSheet.x
        const sizeY = tileSize*this.spriteSheet.y
        const sx = this.progress*sizeX
        const sy = this.inverted ? sizeY : 0
        this.buffer.image(this.spriteSheet.image,0,0,sizeX,sizeY,sx,sy,sizeX,sizeY)
    }

}