"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defines_1 = require("../lib/defines");
const config_1 = require("../public/config");
const log_1 = require("../lib/log");
const tileSpriteSheets = [];
const connectionSpriteSheets = [];
function newTileSpriteSheet(image, config, logo) {
    log_1.log.debug(`Loaded sprite sheet from: ${config.file}`);
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
    log_1.log.debug(`Loaded sprite sheet from: ${config.file}`);
    let connections = connectionSpriteSheets.find(connection => {
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
class TileAsset {
    constructor(size, logo) {
        this.size = size;
        this.spriteSheet = tileSpriteSheets.find(spriteSheet => {
            return spriteSheet.tileSize.x == size.x && spriteSheet.tileSize.y == size.y && spriteSheet.logo == logo;
        }) || tileSpriteSheets.find(spriteSheet => {
            return spriteSheet.tileSize.x == 1 && spriteSheet.tileSize.y == 1;
        });
    }
    drawTile(sketch, progress, inverted = false) {
        const assetSize = this.spriteSheet.assetSize;
        const x = assetSize.x;
        const y = assetSize.y;
        const sx = assetSize.x * progress;
        const sy = inverted && progress < 18 ? assetSize.y : 0;
        sketch.image(this.spriteSheet.image, 0, 0, x, y, sx, sy, x, y);
    }
    drawConnection(sketch, direction, sourceProgress, targetProgress, delta = { x: 0, y: 0 }) {
        const deltaPosition = config_1.tileToPixel(delta);
        const assetSize = config_1.renderSettings.tileSize;
        const sx = assetSize.x * direction;
        const sy = 0;
        const spriteSheet = connectionSpriteSheets.find(spriteSheet => {
            return sourceProgress >= spriteSheet.range.minimum && sourceProgress <= spriteSheet.range.maximum;
        });
        if (!spriteSheet)
            return;
        const connection = spriteSheet.connections.find(connection => {
            return targetProgress >= connection.range.minimum && targetProgress <= connection.range.maximum;
        });
        if (!connection)
            return;
        sketch.image(connection.image, deltaPosition.x, deltaPosition.y, assetSize.x, assetSize.y, sx, sy, assetSize.x, assetSize.y);
    }
    drawAreaBound(sketch, direction, sourceArea, delta = { x: 0, y: 0 }) {
        const deltaPosition = config_1.tileToPixel(delta);
        const assetSize = config_1.renderSettings.tileSize;
        const minX = deltaPosition.x;
        const minY = deltaPosition.y;
        const maxX = assetSize.x + deltaPosition.x;
        const maxY = assetSize.y + deltaPosition.y;
        sketch.stroke(sourceArea);
        switch (direction) {
            case defines_1.Direction.up:
                sketch.line(minX + 3, minY, minX + 9, minY);
                sketch.line(maxX - 9, minY, maxX - 3, minY);
                break;
            case defines_1.Direction.right:
                sketch.line(maxX, minY + 3, maxX, minY + 9);
                sketch.line(maxX, maxY - 9, maxX, maxY - 3);
                break;
            case defines_1.Direction.down:
                sketch.line(minX + 3, maxY, minX + 9, maxY);
                sketch.line(maxX - 9, maxY, maxX - 3, maxY);
                break;
            case defines_1.Direction.left:
                sketch.line(minX, minY + 3, minX, minY + 9);
                sketch.line(minX, maxY - 9, minX, maxY - 3);
                break;
        }
    }
}
exports.TileAsset = TileAsset;
