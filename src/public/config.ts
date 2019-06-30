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

export const logoAssets = [
    { name: 'redmew', file: 'logo000.png'},
    { name: 'fmmo', file: 'logo001.png'},
    { name: 'expgaming', file: 'logo002.png'},
    { name: 'clustorio', file: 'logo003.png'},
    { name: 'lizzian', file: 'logo004.png'},
    { name: 'areyouscared', file: 'logo005.png'},
    { name: 'wbtc', file: 'logo006.png'},
    { name: 'tobi', file: 'logo007.png'},
    { name: 'kaeltar', file: 'logo008.png'},
    { name: 'upcloud', file: 'logo009.png'},
    { name: 'japc', file: 'logo010.png'},
    { name: 'p74', file: 'logo010.png'}
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