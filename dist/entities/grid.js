"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tile_1 = require("./tile");
var defines_1 = require("../lib/defines");
var log_1 = require("../lib/log");
var config_1 = require("../public/config");
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
        var tile = this.tiles.find(function (tile) {
            return position.x == tile.position.x && position.y == tile.position.y;
        });
        return tile instanceof tile_1.Redirect ? tile.tile : tile;
    };
    Grid.prototype.getTileDirection = function (position, direction) {
        switch (direction) {
            case defines_1.Direction.up: {
                return this.getTile({ x: position.x, y: position.y - 1 });
            }
            case defines_1.Direction.right: {
                return this.getTile({ x: position.x + 1, y: position.y });
            }
            case defines_1.Direction.down: {
                return this.getTile({ x: position.x, y: position.y + 1 });
            }
            case defines_1.Direction.left: {
                return this.getTile({ x: position.x - 1, y: position.y });
            }
        }
    };
    Grid.prototype.getAdjacentTiles = function (position) {
        var tile = this.getTile(position);
        var adjacent = [];
        position = tile.position;
        function tileExists(grid, adjacent, x, y) {
            var adjacentTile = grid.getTile({ x: x, y: y });
            if (adjacentTile)
                adjacent.push(adjacentTile);
        }
        for (var sx = 0; sx < tile.size.x; sx++) {
            tileExists(this, adjacent, position.x + sx, position.y - 1);
            tileExists(this, adjacent, position.x + sx, position.y + tile.size.y);
        }
        for (var sy = 0; sy < tile.size.y; sy++) {
            tileExists(this, adjacent, position.x - 1, position.y + sy);
            tileExists(this, adjacent, position.x + tile.size.x, position.y + sy);
        }
        return adjacent;
    };
    Grid.prototype.newRedirect = function (position, tile) {
        var redirect = new tile_1.Redirect(position, tile);
        tile.redirects.push(redirect);
        this.tiles.push(redirect);
    };
    Grid.prototype.newTile = function (position, size, logo) {
        var tile = new tile_1.Tile(position, size, logo);
        this.tiles.push(tile);
        for (var sx = 0; sx < size.x; sx++) {
            for (var sy = 0; sy < size.y; sy++) {
                if (!(sx == 0 && sy == 0)) {
                    this.newRedirect({
                        x: position.x + sx,
                        y: position.y + sy
                    }, tile);
                }
            }
        }
        return tile;
    };
    Grid.prototype.calculateProgress = function (startTile) {
        var queue = [startTile];
        var _loop_1 = function (currentIndex) {
            var tile = queue[currentIndex];
            if (queue.indexOf(tile) >= currentIndex) {
                var adjacent = this_1.getAdjacentTiles(tile.position);
                var newProgress_1 = tile.progress;
                adjacent.forEach(function (adjacentTile) {
                    queue.push(adjacentTile);
                    var calc = config_1.progressCalculations.find(function (calcs) {
                        return adjacentTile.progress >= calcs.min && adjacentTile.progress <= calcs.max;
                    });
                    var rtn = calc.rtn(adjacentTile.progress);
                    if (newProgress_1 < rtn)
                        newProgress_1 = rtn;
                });
                tile.progress = newProgress_1 < 0 ? 0 : newProgress_1;
            }
        };
        var this_1 = this;
        for (var currentIndex = 0; currentIndex < queue.length; currentIndex++) {
            _loop_1(currentIndex);
        }
    };
    Grid.prototype.load = function (data) {
        var _this = this;
        log_1.log.debug('Loading new map data');
        this.tiles = [];
        data.forEach(function (tileData) {
            var tile = _this.newTile(tileData.position, tileData.size, tileData.logo);
            tile.progress = tileData.progress || 0;
            tile.inverted = tileData.inverted || false;
        });
    };
    Grid.prototype.export = function (sketch) {
        var size = this.size;
        var scale = config_1.renderSettings.scale;
        var tileSize = config_1.renderSettings.tileSize;
        sketch.resizeCanvas(size.x * scale * tileSize.x, size.y * scale * tileSize.y);
        sketch.save('gridlock-map.png');
        sketch.resizeCanvas(sketch.windowWidth, sketch.windowHeight);
    };
    Grid.prototype.draw = function (sketch) {
        var _this = this;
        this.tiles.forEach(function (tile) {
            if (tile instanceof tile_1.Tile && tile.progress > 0)
                _this.calculateProgress(tile);
        });
        this.tiles.forEach(function (tile) {
            tile.draw(sketch, _this);
        });
    };
    return Grid;
}());
exports.Grid = Grid;
