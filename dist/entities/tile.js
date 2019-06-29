"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var asset_1 = require("./asset");
var config_1 = require("../public/config");
var Redirect = (function () {
    function Redirect(position, tile) {
        this.position = position;
        this.tile = tile;
    }
    return Redirect;
}());
exports.Redirect = Redirect;
var Tile = (function () {
    function Tile(position, size, logo) {
        this.position = position;
        this.size = size;
        this.progress = 17;
        this.logo = logo;
        this.inverted = false;
        this.asset = new asset_1.TileAsset(size, logo);
    }
    Tile.prototype.draw = function (buffer) {
        var tileBuffer = buffer.createGraphics(config_1.renderSettings.tileSize.x * this.size.x, config_1.renderSettings.tileSize.y * this.size.y);
        this.asset.draw(tileBuffer, this.progress, this.inverted);
        var sx = config_1.renderSettings.tileSize.x * config_1.renderSettings.scale;
        var sy = config_1.renderSettings.tileSize.y * config_1.renderSettings.scale;
        var px = this.position.x * sx;
        var py = this.position.y * sy;
        buffer.image(tileBuffer, px, py, sx, sy);
    };
    return Tile;
}());
exports.Tile = Tile;
