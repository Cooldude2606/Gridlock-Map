import { config } from "./config";
import { log, debugLog, errorLog } from './lib/log';
import { SpriteSheet } from './lib/defines';
import { newBaseAsset } from "./entities/asset.entity";
import { Grid } from "./entities/grid.entity";

const tileAssets: Array<SpriteSheet> = []

const grid = new Grid()
grid.newTile({
    x: 0, y: 0
},{
    x: 1, y: 1
})

function setup() {
    console.log('test1')
    noLoop()
}

function preload() {
    console.log('test2')
    for (let tileAssetIndex = 0; tileAssetIndex < config.tileImages.length; tileAssetIndex++) {
        const detail = config.tileImages[tileAssetIndex]
        if (detail && detail.image) {
            loadImage(detail.image,image => {
                log('info','Loaded asset '+detail.image)
                newBaseAsset({
                    x: detail.x,
                    y: detail.y,
                    logo: detail.logo,
                    image: image
                })
            })
        }
    }
}

function draw() {
    console.log('test3')
    debugLog(grid.toString())
    grid.draw()
}

