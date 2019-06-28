export interface Position {
    readonly x: number
    readonly y: number
}

export interface Size {
    x: number
    y: number
}

export interface SpriteSheet {
    x: number
    y: number
    logo?: string
    image: p5.Image
}

export type Dictionary = { [index: string]: any }