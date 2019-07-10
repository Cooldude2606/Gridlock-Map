import { Dictionary, Size, Position } from "../lib/defines";

//process.env.NODE_ENV = 'development'

export const renderSettings = {
    textSize: 12,
    textColour: '#e4aa5f',
    textBackground: '#313031',
    textBackgroundOutline: '#261f1c',
    allowSelectionAtProgress: 8,
    scale: 2,
    tileSize: {
        x: 26,
        y: 26
    }
}

export function tileToPixel(data: Size|Position): Size|Position {
    return {
        x: data.x*renderSettings.tileSize.x,
        y: data.y*renderSettings.tileSize.y
    }
}

export function pixelToTile(data: Size|Position): Size|Position {
    return {
        x: Math.floor(data.x/(renderSettings.tileSize.x)),
        y: Math.floor(data.y/(renderSettings.tileSize.y))
    }
}

export const tileAssets = [
    { x: 1, y: 1, file: 'tile000.png'},
    { x: 2, y: 1, file: 'tile001.png'},
    { x: 3, y: 1, file: 'tile002.png'},
    { x: 4, y: 1, file: 'tile003.png'},
    { x: 1, y: 2, file: 'tile004.png'},
    { x: 2, y: 2, file: 'tile005.png'},
    { x: 3, y: 2, file: 'tile006.png'},
    { x: 1, y: 3, file: 'tile007.png'},
    { x: 2, y: 3, file: 'tile008.png'},
    { x: 3, y: 3, file: 'tile009.png'},
    { x: 5, y: 3, file: 'tile010.png'},
    { x: 2, y: 4, file: 'tile011.png'},
    { x: 4, y: 4, file: 'tile012.png'},
]

export const logoAssets: Dictionary = {
    redmew: 'logo000.png',
    fmmo: 'logo001.png',
    expgaming: 'logo002.png',
    clustorio: 'logo003.png',
    lizzian: 'logo004.png',
    areyouscared: 'logo005.png',
    wbtc: 'logo006.png',
    tobi: 'logo007.png',
    kaeltar: 'logo008.png',
    upcloud: 'logo009.png',
    japc: 'logo010.png',
    p74: 'logo010.png'
}

export const progressCalculations = [
    { min: 0, max: 6, rtn: (p:number):number => p-4},
    { min: 7, max: 7, rtn: (p:number):number => p-2},
    { min: 8, max: 16, rtn: (p:number):number => 5},
    { min: 17, max: 18, rtn: (p:number):number => 7},
]

export const connectionAssets = [
    { min: 7, max: 7, connections: [
        { min: 0, max: 18, file: 'connection000.png'},
    ]},
    { min: 8, max: 16, connections: [
        { min: 0, max: 16, file: 'connection000.png'},
        { min: 17, max: 18, file: 'connection003.png'}
    ]},
    { min: 17, max: 18, connections: [
        { min: 0, max: 7, file: 'connection000.png'},
        { min: 8, max: 16, file: 'connection002.png'},
        { min: 17, max: 18, file: 'connection001.png'}
    ]}
]