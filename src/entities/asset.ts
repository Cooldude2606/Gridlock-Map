import { TileSpriteSheet, Size, Position, Range, ConnectionSpriteSheet, TileSpriteSheetConfig, ConnectionSpriteSheetConfig, Direction } from '../lib/defines'
import { renderSettings } from "../public/config";
import { log } from '../lib/log';
import p5 = require('p5');

const tileSpriteSheets: Array<TileSpriteSheet> = []
const connectionSpriteSheets: Array<ConnectionSpriteSheet> = []

export function newTileSpriteSheet(image: p5.Image, config: TileSpriteSheetConfig, logo?: string): void {
    log.info(`Loaded sprite sheet from: ${config.file}`)
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
    log.info(`Loaded sprite sheet from: ${config.file}`)
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
            return spriteSheet.tileSize.x == size.x && spriteSheet.tileSize.y == size.y
        })
    }

    drawTile(buffer: p5, position: Position, progress: number, inverted: boolean = false) {
        const scale = renderSettings.scale
        const assetSize = this.spriteSheet.assetSize
        const sx = assetSize.x*progress
        const sy = inverted ? assetSize.y : 0
        log.debug(`Rendered tile: {x:${position.x/scale/assetSize.x},y:${position.y/scale/assetSize.y},p:${progress}}`)
        buffer.image(this.spriteSheet.image,position.x,position.y,assetSize.x*scale,assetSize.y*scale,sx,sy,assetSize.x,assetSize.y)
    }

    drawConnection(buffer: p5, position: Position, direction: Direction, sourceProgress: number, targetProgress: number) {
        const scale = renderSettings.scale
        const assetSize = renderSettings.tileSize
        const sx = assetSize.x*direction
        const sy = 0
        let spriteSheet = connectionSpriteSheets.find(spriteSheet => {
            return sourceProgress >= spriteSheet.range.minimum && sourceProgress <= spriteSheet.range.maximum
        })
        if (!spriteSheet) return
        let connection = spriteSheet.connections.find(connection => {
            return targetProgress >= connection.range.minimum && targetProgress <= connection.range.maximum 
        })
        if (!connection) return
        log.debug(`Rendered connection: {x:${position.x/scale/assetSize.x},y:${position.y/scale/assetSize.y},d:${direction},sp:${sourceProgress},tp:${targetProgress}}`)
        buffer.image(connection.image,position.x,position.y,assetSize.x*scale,assetSize.y*scale,sx,sy,assetSize.x,assetSize.y)
    }

}