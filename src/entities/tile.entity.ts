import { Position, Size } from '../lib/defines'
import { Asset } from './asset.entity';
import { config } from '../config';

export class Tile {

    position: Position
    redirect: Position
    size: Size
    asset: Asset

    constructor(position: Position, size: Size) {
        this.position = position
        this.size = size
    }

    update() {
        this.asset.update()
    }

    draw() {
        const displayScale = config.renderSettings.size*config.renderSettings.scale
        const p = this.position
        const s = this.size
        image(this.asset.buffer,displayScale*p.x,displayScale*p.y,displayScale*s.x,displayScale*s.y)
    }

}