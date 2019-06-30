"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var defines_1 = require("../lib/defines");
var asset_1 = require("./asset");
var config_1 = require("../public/config");
var Redirect = (function () {
    function Redirect(position, tile) {
        this.position = position;
        this.tile = tile;
    }
    Redirect.prototype.draw = function (buffer, grid) {
        var px = this.position.x * config_1.renderSettings.tileSize.x * config_1.renderSettings.scale;
        var py = this.position.y * config_1.renderSettings.tileSize.y * config_1.renderSettings.scale;
        for (var direction = defines_1.Direction.up; direction <= defines_1.Direction.left; direction++) {
            var targetTile = grid.getTileDirection(this.position, direction);
            if (targetTile) {
                this.tile.asset.drawConnection(buffer, { x: px, y: py }, direction, this.tile.progress, targetTile.progress);
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
        this.progress = Math.round(Math.random() * 10 + 7);
        this.logo = logo;
        this.inverted = false;
        this.asset = new asset_1.TileAsset(size, logo);
    }
    Tile.prototype.draw = function (buffer, grid) {
        var px = this.position.x * config_1.renderSettings.tileSize.x * config_1.renderSettings.scale;
        var py = this.position.y * config_1.renderSettings.tileSize.y * config_1.renderSettings.scale;
        this.asset.drawTile(buffer, { x: px, y: py }, this.progress, this.inverted);
        for (var direction = defines_1.Direction.up; direction <= defines_1.Direction.left; direction++) {
            var targetTile = grid.getTileDirection(this.position, direction);
            if (targetTile) {
                this.asset.drawConnection(buffer, { x: px, y: py }, direction, this.progress, targetTile.progress);
            }
        }
    };
    return Tile;
}());
exports.Tile = Tile;
