import p5 = require("p5");

export type Dictionary = { [index: string]: any }

export interface Range {
    minimum: number
    maximum: number
}

export enum Direction {
    up,
    right,
    down,
    left
}
export interface Position {
    x: number
    y: number
}
export interface Size {
    x: number
    y: number
}

export interface Area {
    topLeft: Position
    bottomRight: Position
}

export interface TileSpriteSheetConfig {
    x: number
    y: number
    file: string
}

export interface TileSpriteSheet {
    image: p5.Image
    tileSize: Size
    assetSize: Size
    logo?: string
}

export interface ConnectionSpriteSheetConfig {
    min: number
    max: number
    file: string
}
export interface ConnectionSpriteSheet {
    range: Range
    connections: Array<{
        range: Range
        image: p5.Image
    }>
}

export interface TileImport {
    position: Position
    size: Size
    progress?: number
    inverted?: boolean
    logo?: string
    name?: string
    area?: string
}