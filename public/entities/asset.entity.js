"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
const log_1 = require("../lib/log");
const tileAssets = [];
function newBaseAsset(base) {
    tileAssets.push(base);
}
exports.newBaseAsset = newBaseAsset;
class Asset {
    constructor(size, logo) {
        this.size = size;
        this.logo = logo;
        this.progress = 0;
        const scale = config_1.config.renderSettings.scale;
        this.buffer = createGraphics(size.x * scale, size.y * scale);
        for (let assetIndex = 0; assetIndex < tileAssets.length; assetIndex++) {
            const spriteSheet = tileAssets[assetIndex];
            if (spriteSheet.x == size.x && spriteSheet.y == size.y) {
                if (logo == spriteSheet.logo) {
                    this.spriteSheet = spriteSheet;
                    break;
                }
            }
        }
    }
    update() {
        log_1.debugLog('Updated asset for {{x},{y}}', this.size);
        const tileSize = config_1.config.renderSettings.size;
        const sizeX = tileSize * this.spriteSheet.x;
        const sizeY = tileSize * this.spriteSheet.y;
        const sx = this.progress * sizeX;
        const sy = this.inverted ? sizeY : 0;
        this.buffer.image(this.spriteSheet.image, 0, 0, sizeX, sizeY, sx, sy, sizeX, sizeY);
    }
}
exports.Asset = Asset;
//# sourceMappingURL=asset.entity.js.map