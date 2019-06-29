"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tile_1 = require("./tile");
var log_1 = require("../lib/log");
var Grid = (function () {
    function Grid() {
        this.tiles = [];
    }
    Object.defineProperty(Grid.prototype, "size", {
        get: function () {
            var size = { x: 0, y: 0 };
            var tileCount = this.tiles.length;
            for (var tileIndex = 0; tileIndex < tileCount; tileIndex++) {
                var tile = this.tiles[tileIndex];
                if (size.x < tile.position.x) {
                    size.x = tile.position.x;
                }
                if (size.y < tile.position.y) {
                    size.y = tile.position.y;
                }
            }
            return size;
        },
        enumerable: true,
        configurable: true
    });
    Grid.prototype.getTile = function (position) {
        var tileCount = this.tiles.length;
        for (var tileIndex = 0; tileIndex < tileCount; tileIndex++) {
            var tile = this.tiles[tileIndex];
            if (tile.position.x == position.x && tile.position.y == position.y) {
                return tile instanceof tile_1.Redirect ? tile.tile : tile;
            }
        }
    };
    Grid.prototype.getAdjacentTiles = function (position) {
        var tile = this.getTile(position);
        var adjacent = [];
        function tileExists(grid, adjacent, position) {
            var adjacentTile = grid.getTile(position);
            if (adjacentTile)
                adjacent.push(adjacentTile);
        }
        for (var sx = 0; sx < tile.size.x; sx++) {
            tileExists(this, adjacent, {
                x: tile.position.x + sx,
                y: tile.position.y - 1
            });
            tileExists(this, adjacent, {
                x: tile.position.x + sx,
                y: tile.position.y + tile.size.y
            });
        }
        for (var sy = 0; sy < tile.size.y; sy++) {
            tileExists(this, adjacent, {
                x: tile.position.x - 1,
                y: tile.position.y + sy
            });
            tileExists(this, adjacent, {
                x: tile.position.x + tile.size.x,
                y: tile.position.y + sy
            });
        }
        return adjacent;
    };
    Grid.prototype.removeTileRaw = function (position) {
        var tileCount = this.tiles.length;
        for (var tileIndex = 0; tileIndex < tileCount; tileIndex++) {
            var tile = this.tiles[tileIndex];
            if (tile.position.x == position.x && tile.position.y == position.y) {
                this.tiles.splice(tileIndex, 1);
                break;
            }
        }
    };
    Grid.prototype.removeTile = function (position) {
        var _this = this;
        var tile = this.getTile(position);
        this.removeTileRaw(position);
        tile.redirects.forEach(function (redirect) {
            _this.removeTileRaw(redirect.position);
        });
    };
    Grid.prototype.areaClear = function (position, size) {
        for (var sx = 0; sx < size.x; sx++) {
            for (var sy = 0; sy < size.y; sy++) {
                if (sx != 0 && sy != 0) {
                    var tile = this.getTile({
                        x: position.x + sx,
                        y: position.y + sy
                    });
                    if (tile)
                        return false;
                }
            }
        }
        return true;
    };
    Grid.prototype.newRedirect = function (position, tile) {
        var redirect = new tile_1.Redirect(position, tile);
        tile.redirects.push(redirect);
        this.tiles.push(redirect);
    };
    Grid.prototype.newTile = function (position, size) {
        var tile = new tile_1.Tile(position, size);
        this.tiles.push(tile);
        for (var sx = 0; sx < size.x; sx++) {
            for (var sy = 0; sy < size.y; sy++) {
                if (sx != 0 && sy != 0) {
                    this.newRedirect({
                        x: position.x + sx,
                        y: position.y + sy
                    }, tile);
                }
            }
        }
    };
    Grid.prototype.draw = function (buffer) {
        this.tiles.forEach(function (tile) {
            if (tile instanceof tile_1.Tile) {
                log_1.log.debug("Rendered tile at: {" + tile.position.x + "," + tile.position.y + "}");
                tile.draw(buffer);
            }
        });
    };
    return Grid;
}());
exports.Grid = Grid;
