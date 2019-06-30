"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("../public/config");
var log_1 = require("../lib/log");
var tileSpriteSheets = [];
var connectionSpriteSheets = [];
function newTileSpriteSheet(image, config, logo) {
    log_1.log.info("Loaded sprite sheet from: " + config.file);
    tileSpriteSheets.push({
        image: image,
        tileSize: {
            x: config.x,
            y: config.y,
        },
        assetSize: {
            x: config.x * config_1.renderSettings.tileSize.x,
            y: config.y * config_1.renderSettings.tileSize.y,
        },
        logo: logo
    });
}
exports.newTileSpriteSheet = newTileSpriteSheet;
function newConnectionSpriteSheet(image, range, config) {
    log_1.log.info("Loaded sprite sheet from: " + config.file);
    var connections = connectionSpriteSheets.find(function (connection) {
        return range.minimum == connection.range.minimum && range.maximum == connection.range.maximum;
    });
    if (!connections) {
        connections = {
            range: range,
            connections: []
        };
        connectionSpriteSheets.push(connections);
    }
    connections.connections.push({
        range: {
            minimum: config.min,
            maximum: config.max
        },
        image: image
    });
}
exports.newConnectionSpriteSheet = newConnectionSpriteSheet;
var TileAsset = (function () {
    function TileAsset(size, logo) {
        this.size = size;
        this.spriteSheet = tileSpriteSheets.find(function (spriteSheet) {
            return spriteSheet.tileSize.x == size.x && spriteSheet.tileSize.y == size.y;
        });
    }
    TileAsset.prototype.drawTile = function (buffer, position, progress, inverted) {
        if (inverted === void 0) { inverted = false; }
        var scale = config_1.renderSettings.scale;
        var assetSize = this.spriteSheet.assetSize;
        var sx = assetSize.x * progress;
        var sy = inverted ? assetSize.y : 0;
        log_1.log.debug("Rendered tile: {x:" + position.x / scale / assetSize.x + ",y:" + position.y / scale / assetSize.y + ",p:" + progress + "}");
        buffer.image(this.spriteSheet.image, position.x, position.y, assetSize.x * scale, assetSize.y * scale, sx, sy, assetSize.x, assetSize.y);
    };
    TileAsset.prototype.drawConnection = function (buffer, position, direction, sourceProgress, targetProgress) {
        var scale = config_1.renderSettings.scale;
        var assetSize = config_1.renderSettings.tileSize;
        var sx = assetSize.x * direction;
        var sy = 0;
        var spriteSheet = connectionSpriteSheets.find(function (spriteSheet) {
            return sourceProgress >= spriteSheet.range.minimum && sourceProgress <= spriteSheet.range.maximum;
        });
        if (!spriteSheet)
            return;
        var connection = spriteSheet.connections.find(function (connection) {
            return targetProgress >= connection.range.minimum && targetProgress <= connection.range.maximum;
        });
        if (!connection)
            return;
        log_1.log.debug("Rendered connection: {x:" + position.x / scale / assetSize.x + ",y:" + position.y / scale / assetSize.y + ",d:" + direction + ",sp:" + sourceProgress + ",tp:" + targetProgress + "}");
        buffer.image(connection.image, position.x, position.y, assetSize.x * scale, assetSize.y * scale, sx, sy, assetSize.x, assetSize.y);
    };
    return TileAsset;
}());
exports.TileAsset = TileAsset;
