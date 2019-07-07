"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const asset_1 = require("./asset");
const config_1 = require("../public/config");
const defines_1 = require("../lib/defines");
const log_1 = require("../lib/log");
class Redirect {
    constructor(position, tile) {
        this.position = position;
        this.tile = tile;
        this.delta = {
            x: position.x - tile.position.x,
            y: position.y - tile.position.y
        };
    }
    updateTileBuffer(grid) {
        const tile = this.tile;
        const renderRequirement = config_1.renderSettings.allowSelectionAtProgress;
        for (let direction = defines_1.Direction.up; direction <= defines_1.Direction.left; direction++) {
            const targetTile = grid.getTileDirection(this.position, direction);
            if (targetTile && targetTile !== this.tile) {
                if (tile.area && tile.area != targetTile.area && tile.progress >= renderRequirement) {
                    log_1.log.debug(`Rendered area bound: {x:${this.position.x},y:${this.position.y},d:${defines_1.Direction[direction]},sa:${tile.area},ta:${targetTile.area}}`);
                    tile.asset.drawAreaBound(tile.buffer, direction, tile.area, this.delta);
                }
                log_1.log.debug(`Rendered connection: {x:${this.position.x},y:${this.position.y},d:${defines_1.Direction[direction]},sp:${tile.progress},tp:${targetTile.progress}}`);
                tile.asset.drawConnection(tile.buffer, direction, tile.progress, targetTile.progress, this.delta);
            }
            else if (!targetTile && tile.area && tile.progress >= renderRequirement) {
                log_1.log.debug(`Rendered area bound: {x:${this.position.x},y:${this.position.y},d:${defines_1.Direction[direction]},sa:${tile.area},ta:Null}`);
                tile.asset.drawAreaBound(tile.buffer, direction, tile.area, this.delta);
            }
        }
    }
}
exports.Redirect = Redirect;
class Tile {
    constructor(position, size, logo) {
        this.position = position;
        this.size = size;
        this.asset = new asset_1.TileAsset(size, logo);
        this.redirects = [];
        this.progress = 0;
        this.inverted = false;
        this.logo = logo;
        this.name = `X: ${position.x} Y: ${position.y}`;
    }
    newBuffer(sketch, grid) {
        const size = config_1.tileToPixel(this.size);
        if (this.buffer)
            this.buffer.remove();
        this.buffer = sketch.createGraphics(size.x, size.y);
        const context = this.buffer.elt.getContext('2d');
        context.imageSmoothingEnabled = false;
        log_1.log.debug(`Rendered tile: {x:${this.position.x},y:${this.position.y},p:${this.progress},i:${this.inverted}}`);
        this.asset.drawTile(this.buffer, this.progress, this.inverted);
        const renderRequirement = config_1.renderSettings.allowSelectionAtProgress;
        for (let direction = defines_1.Direction.up; direction <= defines_1.Direction.left; direction++) {
            const targetTile = grid.getTileDirection(this.position, direction);
            if (targetTile && targetTile !== this) {
                if (this.area && this.area != targetTile.area && this.progress >= renderRequirement) {
                    log_1.log.debug(`Rendered area bound: {x:${this.position.x},y:${this.position.y},d:${defines_1.Direction[direction]},sa:${this.area},ta:${targetTile.area}}`);
                    this.asset.drawAreaBound(this.buffer, direction, this.area);
                }
                log_1.log.debug(`Rendered connection: {x:${this.position.x},y:${this.position.y},d:${defines_1.Direction[direction]},sp:${this.progress},tp:${targetTile.progress}}`);
                this.asset.drawConnection(this.buffer, direction, this.progress, targetTile.progress);
            }
            else if (!targetTile && this.area && this.progress >= renderRequirement) {
                log_1.log.debug(`Rendered area bound: {x:${this.position.x},y:${this.position.y},d:${defines_1.Direction[direction]},sa:${this.area},ta:Null}`);
                this.asset.drawAreaBound(this.buffer, direction, this.area);
            }
        }
        this.redirects.forEach(redirect => {
            redirect.updateTileBuffer(grid);
        });
    }
    draw(sketch, grid) {
        if (!this.buffer)
            this.newBuffer(sketch, grid);
        const topLeft = config_1.tileToPixel(grid.area.topLeft);
        const positionPixel = config_1.tileToPixel(this.position);
        grid.buffer.image(this.buffer, positionPixel.x - topLeft.x, positionPixel.y - topLeft.y);
    }
}
exports.Tile = Tile;
