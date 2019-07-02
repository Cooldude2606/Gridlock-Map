import { TileSpriteSheet, Size, Position, Range, ConnectionSpriteSheet, TileSpriteSheetConfig, ConnectionSpriteSheetConfig, Direction } from '../lib/defines'
import { renderSettings, tileToPixel } from "../public/config";
import { log } from '../lib/log';
import p5 = require('p5');

const tileSpriteSheets: Array<TileSpriteSheet> = []
const connectionSpriteSheets: Array<ConnectionSpriteSheet> = []

export function newTileSpriteSheet(image: p5.Image, config: TileSpriteSheetConfig, logo?: string): void {
    log.debug(`Loaded sprite sheet from: ${config.file}`)
    tileSpriteSheets.push({
        image: image,
        tileSize: {
            x: config.x,
            y: config.y,
        },
        assetSize: {
            x: config.x*renderSettings.tileSize.x,
            y: config.y*renderSettings.tileSize.y,
        },
        logo: logo
    })
}

export function newConnectionSpriteSheet(image: p5.Image, range: Range, config: ConnectionSpriteSheetConfig): void {
    log.debug(`Loaded sprite sheet from: ${config.file}`)
    let connections = connectionSpriteSheets.find(connection => {
        return range.minimum == connection.range.minimum && range.maximum == connection.range.maximum
    })
    if (!connections) {
        connections = {
            range: range,
            connections: []
        }
        connectionSpriteSheets.push(connections)
    }
    connections.connections.push({
        range: {
            minimum: config.min,
            maximum: config.max
        },
        image: image
    })
}

export class TileAsset {

    size: Size
    spriteSheet: TileSpriteSheet

    constructor(size: Size, logo?: string) {
        this.size = size
        this.spriteSheet = tileSpriteSheets.find(spriteSheet => {
            return spriteSheet.tileSize.x == size.x && spriteSheet.tileSize.y == size.y && spriteSheet.logo == logo
        })
    }

    drawTile(sketch: p5, progress: number, inverted: boolean = false) {
        const assetSize = this.spriteSheet.assetSize
        const x = assetSize.x
        const y = assetSize.y
        const sx = assetSize.x*progress
        const sy = inverted && progress < 18 ? assetSize.y : 0
        sketch.image(this.spriteSheet.image,0,0,x,y,sx,sy,x,y)
    }

    drawConnection(sketch: p5, direction: Direction, sourceProgress: number, targetProgress: number, delta: Position = {x:0,y:0}) {
        const deltaPosition = tileToPixel(delta)
        const assetSize = renderSettings.tileSize
        const sx = assetSize.x*direction
        const sy = 0

        const spriteSheet = connectionSpriteSheets.find(spriteSheet => {
            return sourceProgress >= spriteSheet.range.minimum && sourceProgress <= spriteSheet.range.maximum
        })
        if (!spriteSheet) return

        const connection = spriteSheet.connections.find(connection => {
            return targetProgress >= connection.range.minimum && targetProgress <= connection.range.maximum 
        })
        if (!connection) return

        sketch.image(connection.image,deltaPosition.x,deltaPosition.y,assetSize.x,assetSize.y,sx,sy,assetSize.x,assetSize.y)
    }

}