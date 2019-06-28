"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
class Tile {
    constructor(position, size) {
        this.position = position;
        this.size = size;
    }
    update() {
        this.asset.update();
    }
    draw() {
        const displayScale = config_1.config.renderSettings.size * config_1.config.renderSettings.scale;
        const p = this.position;
        const s = this.size;
        image(this.asset.buffer, displayScale * p.x, displayScale * p.y, displayScale * s.x, displayScale * s.y);
    }
}
exports.Tile = Tile;
//# sourceMappingURL=tile.entity.js.map