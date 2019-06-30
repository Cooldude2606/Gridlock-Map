import p5 = require("p5");
import "p5/lib/addons/p5.dom"
import { Range, TileExport } from "../lib/defines";
import { tileAssets, connectionAssets, logoAssets } from "./config";
import { newTileSpriteSheet, newConnectionSpriteSheet } from "../entities/asset";
import { Grid } from "../entities/grid";

process.env.NODE_ENV = 'development'

function sketchDefine(sketch: p5) {

    const grid = new Grid()

    let canvas: p5.Renderer

    sketch.setup = () => {
        canvas = sketch.createCanvas(sketch.windowWidth, sketch.windowHeight)
        sketch.noLoop()

        canvas.drop(file => {
            if (file.subtype == 'json') {
                sketch.loadJSON(file.data,(data: Array<TileExport>) => {
                    grid.load(data)
                    sketch.redraw()
                })
            }
        })

        let context = canvas.elt.getContext('2d');
        context.imageSmoothingEnabled = false;

        for (let x = 0; x < 10;x++) {
            for (let y = 0; y < 10;y++) {
                grid.newTile({x:x,y:y},{x:1,y:1})
            }
        }
    }

    sketch.preload = () => {
        tileAssets.forEach(config => {
            sketch.loadImage(`assets/${config.file}`,image => {
                newTileSpriteSheet(image,config)
            })
        })
        logoAssets.forEach(config => {
            sketch.loadImage(`assets/${config.file}`,image => {
                newTileSpriteSheet(image,{
                    x: 2,
                    y: 2,
                    file: config.file
                },config.name)
            })
        })
        connectionAssets.forEach(config => {
            const range: Range = {minimum: config.min, maximum: config.max}
            config.connections.forEach(connection => {
                sketch.loadImage(`assets/${connection.file}`,image => {
                    newConnectionSpriteSheet(image,range,connection)
                })
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