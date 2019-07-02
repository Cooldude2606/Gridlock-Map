"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var asset_1 = require("./asset");
var config_1 = require("../public/config");
var defines_1 = require("../lib/defines");
var log_1 = require("../lib/log");
var Redirect = (function () {
    function Redirect(position, tile) {
        this.position = position;
        this.tile = tile;
        this.delta = {
            x: position.x - tile.position.x,
            y: position.y - tile.position.y
        };
    }
    Redirect.prototype.updateTileBuffer = function (grid) {
        var tile = this.tile;
        for (var direction = defines_1.Direction.up; direction <= defines_1.Direction.left; direction++) {
            var targetTile = grid.getTileDirection(this.position, direction);
            if (targetTile && targetTile !== this.tile) {
                tile.asset.drawConnection(tile.buffer, direction, tile.progress, targetTile.progress, this.delta);
            }
        }
    };
    return Redirect;
}());
exports.Redirect = Redirect;
var Tile = (function () {
    function Tile(position, size, logo) {
        this.position = position;
        this.size = size;
        var ran = Math.random();
        if (ran < 0.95)
            this.progress = 0;
        else if (ran < 0.98)
            this.progress = 8;
        else
            this.progress = 18;
        this.logo = logo;
        this.inverted = false;
        this.redirects = [];
        this.asset = new asset_1.TileAsset(size, logo);
    }
    Tile.prototype.newBuffer = function (sketch, grid) {
        var size = config_1.tileToPixel(this.size);
        if (this.buffer)
            this.buffer.remove();
        this.buffer = sketch.createGraphics(size.x, size.y);
        var context = this.buffer.elt.getContext('2d');
        context.imageSmoothingEnabled = false;
        log_1.log.debug("Rendered tile: {x:" + this.position.x + ",y:" + this.position.y + ",p:" + this.progress + ",i:" + this.inverted + "}");
        this.asset.drawTile(this.buffer, this.progress, this.inverted);
        for (var direction = defines_1.Direction.up; direction <= defines_1.Direction.left; direction++) {
            var targetTile = grid.getTileDirection(this.position, direction);
            if (targetTile && targetTile !== this) {
                log_1.log.debug("Rendered connection: {x:" + this.position.x + ",y:" + this.position.y + ",d:" + defines_1.Direction[direction] + ",sp:" + this.progress + ",tp:" + targetTile.progress + "}");
                this.asset.drawConnection(this.buffer, direction, this.progress, targetTile.progress);
            }
        }
        this.redirects.forEach(function (redirect) {
            redirect.updateTileBuffer(grid);
        });
    };
    Tile.prototype.draw = function (sketch, grid) {
        if (!this.buffer)
            this.newBuffer(sketch, grid);
        var positionPixel = config_1.tileToPixel(this.position);
        grid.buffer.image(this.buffer, positionPixel.x, positionPixel.y);
    };
    return Tile;
}());
exports.Tile = Tile;
