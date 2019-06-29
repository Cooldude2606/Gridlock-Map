import p5 = require("p5");

export type Dictionary = { [index: string]: any }

export interface Range {
    minimum: number,
    maximum: number
}

export interface Position {
    x: number,
    y: number
}
export interface Size {
    x: number,
    y: number
}

export interface SpriteSheet {
    image: p5.Image
    tileSize: Size,
    assetSize: Size,
    logo?: string,
    connection?: string
}

export type ImageBuffer = p5|p5.Renderer|p5.Graphics|any