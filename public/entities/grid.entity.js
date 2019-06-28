"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tile_entity_1 = require("./tile.entity");
const config_1 = require("../config");
class Grid {
    get size() {
        const size = { x: 0, y: 0 };
        const tileCount = this.tiles.length;
        for (let tileIndex = 0; tileIndex < tileCount; tileIndex++) {
            const tile = this.tiles[tileIndex];
            if (size.x < tile.size.x) {
                size.x = tile.size.x;
            }
            if (size.y < tile.size.y) {
                size.y = tile.size.y;
            }
        }
        return size;
    }
    getTile(position) {
        const tileCount = this.tiles.length;
        for (let tileIndex = 0; tileIndex < tileCount; tileIndex++) {
            const tile = this.tiles[tileIndex];
            if (tile.position.x == position.x && tile.position.y == position.y) {
                return tile.redirect ? this.getTile(tile.redirect) : tile;
            }
        }
    }
    getAdjacentTiles(position) {
        const tile = this.getTile(position);
        const adjacent = [];
        function tileExists(grid, adjacent, position) {
            const adjacentTile = grid.getTile(position);
            if (adjacentTile)
                adjacent.push(adjacentTile);
        }
        for (let sx = 0; sx < tile.size.x; sx++) {
            tileExists(this, adjacent, {
                x: tile.position.x + sx,
                y: tile.position.y - 1
            });
            tileExists(this, adjacent, {
                x: tile.position.x + sx,
                y: tile.position.y + tile.size.y
            });
        }
        for (let sy = 0; sy < tile.size.y; sy++) {
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
    }
    removeTileRaw(position) {
        const tileCount = this.tiles.length;
        for (let tileIndex = 0; tileIndex < tileCount; tileIndex++) {
            const tile = this.tiles[tileIndex];
            if (tile.position.x == position.x && tile.position.y == position.y) {
                this.tiles.splice(tileIndex, 1);
                break;
            }
        }
    }
    removeTile(position) {
        const tileCount = this.tiles.length;
        for (let tileIndex = 0; tileIndex < tileCount; tileIndex++) {
            const tile = this.tiles[tileIndex];
            if (tile.position.x == position.x && tile.position.y == position.y) {
                for (let sx = 0; sx < tile.size.x; sx++) {
                    for (let sy = 0; sy < tile.size.y; sy++) {
                        this.removeTileRaw({
                            x: tile.position.x + sx,
                            y: tile.position.y + sy
                        });
                    }
                }
                break;
            }
        }
    }
    areaClear(position, size) {
        for (let sx = 0; sx < size.x; sx++) {
            for (let sy = 0; sy < size.y; sy++) {
                if (sx != 0 && sy != 0) {
                    const tile = this.getTile({
                        x: position.x + sx,
                        y: position.y + sy
                    });
                    if (tile) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    newRedirect(position, tilePosition) {
        const tile = new tile_entity_1.Tile(position, { x: 0, y: 0 });
        tile.redirect = tilePosition;
        this.tiles.push(tile);
    }
    newTile(position, size) {
        const tile = new tile_entity_1.Tile(position, size);
        this.tiles.push(tile);
        for (let sx = 0; sx < size.x; sx++) {
            for (let sy = 0; sy < size.y; sy++) {
                if (sx != 0 && sy != 0) {
                    this.newRedirect({
                        x: position.x + sx,
                        y: position.y + sy
                    }, position);
                }
            }
        }
    }
    draw() {
        const size = this.size;
        if (!this.canvas) {
            const scale = config_1.config.renderSettings.size * config_1.config.renderSettings.scale;
            this.canvas = createCanvas(scale * size.x, scale * size.y);
        }
        this.tiles.forEach(tile => tile.draw());
    }
}
exports.Grid = Grid;
//# sourceMappingURL=grid.entity.js.map