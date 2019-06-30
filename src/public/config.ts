import { Dictionary } from "../lib/defines";

export const renderSettings = {
    scale: 2,
    tileSize: {
        x: 26,
        y: 26
    }
}

export const tileAssets = [
    { x: 1, y: 1, file: 'tile000.png'},
    { x: 2, y: 1, file: 'tile001.png'},
    { x: 1, y: 2, file: 'tile002.png'},
    { x: 2, y: 2, file: 'tile003.png'}
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
    { min: 0, max: 6, rtn: (p:number):number => p-2},
    { min: 7, max: 7, rtn: (p:number):number => p-1},
    { min: 8, max: 16, rtn: (p:number):number => 6},
    { min: 17, max: 17, rtn: (p:number):number => 7},
]

export const connectionAssets = [
    { min: 7, max: 7, connections: [
        { min: 0, max: 17, file: 'connection000.png'},
    ]},
    { min: 8, max: 16, connections: [
        { min: 0, max: 16, file: 'connection000.png'},
        { min: 17, max: 17, file: 'connection003.png'}
    ]},
    { min: 17, max: 17, connections: [
        { min: 0, max: 7, file: 'connection000.png'},
        { min: 8, max: 16, file: 'connection002.png'},
        { min: 17, max: 17, file: 'connection001.png'}
    ]}
]