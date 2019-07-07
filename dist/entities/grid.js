"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log_1 = require("../lib/log");
const tile_1 = require("./tile");
const defines_1 = require("../lib/defines");
const config_1 = require("../public/config");
class Grid {
    constructor() {
        this.tiles = [];
    }
    get area() {
        const area = { topLeft: { x: 0, y: 0 }, bottomRight: { x: 0, y: 0 } };
        this.tiles.forEach(tile => {
            const pos = tile.position;
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
    }
    get size() {
        const area = this.area;
        return {
            x: area.bottomRight.x - area.topLeft.x + 1,
            y: area.bottomRight.y - area.topLeft.y + 1
        };
    }
    getTile(position) {
        const tile = this.tiles.find(tile => {
            return position.x == tile.position.x && position.y == tile.position.y;
        });
        return tile instanceof tile_1.Redirect ? tile.tile : tile;
    }
    getTileDirection(position, direction) {
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
    }
    getAdjacentTiles(position) {
        const tile = this.getTile(position);
        const adjacent = [];
        position = tile.position;
        function tileExists(grid, adjacent, x, y) {
            const adjacentTile = grid.getTile({ x: x, y: y });
            if (adjacentTile)
                adjacent.push(adjacentTile);
        }
        for (let sx = 0; sx < tile.size.x; sx++) {
            tileExists(this, adjacent, position.x + sx, position.y - 1);
            tileExists(this, adjacent, position.x + sx, position.y + tile.size.y);
        }
        for (let sy = 0; sy < tile.size.y; sy++) {
            tileExists(this, adjacent, position.x - 1, position.y + sy);
            tileExists(this, adjacent, position.x + tile.size.x, position.y + sy);
        }
        return adjacent;
    }
    newRedirect(position, tile) {
        const redirect = new tile_1.Redirect(position, tile);
        tile.redirects.push(redirect);
        this.tiles.push(redirect);
    }
    newTile(position, size, logo) {
        const tile = new tile_1.Tile(position, size, logo);
        this.tiles.push(tile);
        for (let sx = 0; sx < size.x; sx++) {
            for (let sy = 0; sy < size.y; sy++) {
                if (!(sx == 0 && sy == 0)) {
                    this.newRedirect({
                        x: position.x + sx,
                        y: position.y + sy
                    }, tile);
                }
            }
        }
        return tile;
    }
    calculateProgress(startTile) {
        const queue = [startTile];
        for (let currentIndex = 0; currentIndex < queue.length; currentIndex++) {
            const tile = queue[currentIndex];
            const adjacent = this.getAdjacentTiles(tile.position);
            let newProgress = tile.progress;
            adjacent.forEach(adjacentTile => {
                const calc = config_1.progressCalculations.find(calcs => {
                    return adjacentTile.progress >= calcs.min && adjacentTile.progress <= calcs.max;
                });
                const rtn = calc.rtn(adjacentTile.progress);
                if (newProgress < rtn)
                    newProgress = rtn;
            });
            tile.progress = newProgress < 0 ? 0 : newProgress;
            if (tile.progress > 0) {
                adjacent.forEach(adjacentTile => {
                    if (!queue.includes(adjacentTile))
                        queue.push(adjacentTile);
                });
            }
        }
    }
    calculateProgressAll() {
        this.tiles.forEach(tile => {
            if (tile instanceof tile_1.Tile && tile.progress > 0)
                this.calculateProgress(tile);
        });
    }
    load(data) {
        log_1.log.debug('Loading new map data');
        this.tiles = [];
        data.forEach(tileData => {
            const tile = this.newTile({ x: tileData.TopLeftCoordinate.X, y: tileData.TopLeftCoordinate.Y }, { x: tileData.Width, y: tileData.Height }, tileData.logoName);
            tile.progress = tileData.progress || 0;
            tile.inverted = tileData.rocketLaunched || false;
            if (tileData.Name)
                tile.name = tileData.Name;
            tile.area = tileData.regionColor;
        });
        this.calculateProgressAll();
    }
    newTileBuffers(sketch) {
        this.tiles.forEach(tile => {
            if (tile instanceof tile_1.Tile) {
                tile.newBuffer(sketch, this);
            }
        });
    }
    newBuffer(sketch) {
        const size = config_1.tileToPixel(this.size);
        if (this.buffer)
            this.buffer.remove();
        this.buffer = sketch.createGraphics(size.x, size.y);
        this.center = { x: size.x / 2, y: size.y / 2 };
        const context = this.buffer.elt.getContext('2d');
        context.imageSmoothingEnabled = false;
        this.tiles.forEach(tile => {
            if (tile instanceof tile_1.Tile) {
                tile.draw(sketch, this);
            }
        });
        log_1.log.debug(`Rendered grid: {}`);
    }
    draw(sketch) {
        if (!this.buffer)
            this.newBuffer(sketch);
        sketch.image(this.buffer, -this.center.x, -this.center.y);
    }
}
exports.Grid = Grid;
