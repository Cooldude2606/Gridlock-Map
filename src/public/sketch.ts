import p5 = require("p5");
import { tileAssets } from "./config";
import { newTileSpriteSheet } from "../entities/asset";
import { Grid } from "../entities/grid";

process.env.NODE_ENV = 'development'

function sketchDefine(sketch: p5) {

    const grid = new Grid()

    let canvas: p5.Renderer

    sketch.setup = () => {
        canvas = sketch.createCanvas(sketch.windowWidth, sketch.windowHeight)
        sketch.noLoop()

        let context = canvas.elt.getContext('2d');
        context.imageSmoothingEnabled = false;

        for (let x = 0; x < 10;x++) {
            for (let y = 0; y < 10;y++) {
                if (x%2 != 0 && y%3 != 0) {
                    grid.newTile({x:x,y:y},{x:1,y:1})
                }
            }
        }
    }

    sketch.preload = () => {
        tileAssets.forEach(asset => {
            sketch.loadImage(`assets/${asset.file}`,image => {
                newTileSpriteSheet(image,asset)
            })
        })
    }
    
    sketch.draw = () => {
        sketch.clear()
        sketch.background(0)
        
        grid.draw(sketch)
    }

}

new p5(sketchDefine).redraw()