"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const log_1 = require("./lib/log");
const asset_entity_1 = require("./entities/asset.entity");
const grid_entity_1 = require("./entities/grid.entity");
const tileAssets = [];
const grid = new grid_entity_1.Grid();
grid.newTile({
    x: 0, y: 0
}, {
    x: 1, y: 1
});
function setup() {
    console.log('test1');
    noLoop();
}
function preload() {
    console.log('test2');
    for (let tileAssetIndex = 0; tileAssetIndex < config_1.config.tileImages.length; tileAssetIndex++) {
        const detail = config_1.config.tileImages[tileAssetIndex];
        if (detail && detail.image) {
            loadImage(detail.image, image => {
                log_1.log('info', 'Loaded asset ' + detail.image);
                asset_entity_1.newBaseAsset({
                    x: detail.x,
                    y: detail.y,
                    logo: detail.logo,
                    image: image
                });
            });
        }
    }
}
function draw() {
    console.log('test3');
    log_1.debugLog(grid.toString());
    grid.draw();
}
//# sourceMappingURL=sketch.js.map