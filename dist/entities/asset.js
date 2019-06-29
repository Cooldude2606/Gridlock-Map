"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("../public/config");
var log_1 = require("../lib/log");
var spriteSheets = [];
function newTileSpriteSheet(image, asset, logo) {
    log_1.log.info("Loaded sprite sheet from: " + asset.file);
    spriteSheets.push({
        image: image,
        tileSize: {
            x: asset.x,
            y: asset.y,
        },
        assetSize: {
            x: asset.x * config_1.renderSettings.tileSize.x,
            y: asset.y * config_1.renderSettings.tileSize.y,
        },
        logo: logo
    });
}
exports.newTileSpriteSheet = newTileSpriteSheet;
var TileAsset = (function () {
    function TileAsset(size, logo) {
        this.size = size;
        this.spriteSheet = spriteSheets.find(function (spriteSheet) {
            if (spriteSheet.tileSize.x == size.x && spriteSheet.tileSize.y == size.y) {
                return spriteSheet;
            }
        });
    }
    TileAsset.prototype.draw = function (buffer, progress, inverted) {
        if (inverted === void 0) { inverted = false; }
        var assetSize = this.spriteSheet.assetSize;
        var sx = assetSize.x * progress;
        var sy = inverted ? assetSize.y : 0;
        buffer.image(this.spriteSheet.image, 0, 0, assetSize.x, assetSize.y, sx, sy, assetSize.x, assetSize.y);
    };
    return TileAsset;
}());
exports.TileAsset = TileAsset;
var ConnectionAsset = (function () {
    function ConnectionAsset() {
    }
    return ConnectionAsset;
}());
exports.ConnectionAsset = ConnectionAsset;
