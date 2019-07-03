"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log_1 = require("../lib/log");
var tile_1 = require("./tile");
var defines_1 = require("../lib/defines");
var config_1 = require("../public/config");
var Grid = (function () {
    function Grid() {
        this.tiles = [];
    }
    Object.defineProperty(Grid.prototype, "area", {
        get: function () {
            var area = { topLeft: { x: 0, y: 0 }, bottomRight: { x: 0, y: 0 } };
            this.tiles.forEach(function (tile) {
                var pos = tile.position;
                if (pos.x < area.topLeft.x)
                    area.topLeft.x = pos.x;
                if (pos.x > area.bottomRight.x)
                    area.bottomRight.x = pos.x;
                if (pos.y < area.topLeft.y)
                    area.topLeft.y = pos.y;
                if (pos.y > area.bottomRight.y)
                    area.bottomRight.y = pos.y;
            });
            return area;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Grid.prototype, "size", {
        get: function () {
            var area = this.area;
            return {
                x: area.bottomRight.x - area.topLeft.x + 1,
                y: area.bottomRight.y - area.topLeft.y + 1
            };
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
            var adjacent = this_1.getAdjacentTiles(tile.position);
            var newProgress = tile.progress;
            adjacent.forEach(function (adjacentTile) {
                var calc = config_1.progressCalculations.find(function (calcs) {
                    return adjacentTile.progress >= calcs.min && adjacentTile.progress <= calcs.max;
                });
                var rtn = calc.rtn(adjacentTile.progress);
                if (newProgress < rtn)
                    newProgress = rtn;
            });
            tile.progress = newProgress < 0 ? 0 : newProgress;
            if (tile.progress > 0) {
                adjacent.forEach(function (adjacentTile) {
                    if (!queue.includes(adjacentTile))
                        queue.push(adjacentTile);
                });
            }
        };
        var this_1 = this;
        for (var currentIndex = 0; currentIndex < queue.length; currentIndex++) {
            _loop_1(currentIndex);
        }
    };
    Grid.prototype.calculateProgressAll = function () {
        var _this = this;
        this.tiles.forEach(function (tile) {
            if (tile instanceof tile_1.Tile && tile.progress > 0)
                _this.calculateProgress(tile);
        });
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
        this.calculateProgressAll();
    };
    Grid.prototype.newTileBuffers = function (sketch) {
        var _this = this;
        this.tiles.forEach(function (tile) {
            if (tile instanceof tile_1.Tile) {
                tile.newBuffer(sketch, _this);
            }
        });
    };
    Grid.prototype.newBuffer = function (sketch) {
        var _this = this;
        var size = config_1.tileToPixel(this.size);
        if (this.buffer)
            this.buffer.remove();
        this.buffer = sketch.createGraphics(size.x, size.y);
        this.center = { x: size.x / 2, y: size.y / 2 };
        var context = this.buffer.elt.getContext('2d');
        context.imageSmoothingEnabled = false;
        this.tiles.forEach(function (tile) {
            if (tile instanceof tile_1.Tile) {
                tile.draw(sketch, _this);
            }
        });
        log_1.log.debug("Rendered grid: {}");
    };
    Grid.prototype.draw = function (sketch) {
        if (!this.buffer)
            this.newBuffer(sketch);
        sketch.image(this.buffer, -this.center.x, -this.center.y);
    };
    return Grid;
}());
exports.Grid = Grid;
