import p5 = require("p5");
import "p5/lib/addons/p5.dom"
import { Range, TileImport } from "../lib/defines";
import { tileAssets, connectionAssets, logoAssets } from "./config";
import { newTileSpriteSheet, newConnectionSpriteSheet } from "../entities/asset";
import { Grid } from "../entities/grid";

function sketchDefine(sketch: p5) {

    const grid = new Grid()

    let canvas: p5.Renderer

    sketch.setup = () => {
        canvas = sketch.createCanvas(sketch.windowWidth, sketch.windowHeight)
        sketch.noLoop()

        canvas.drop(file => {
            if (file.subtype == 'json') {
                sketch.loadJSON(file.data,(data: Array<TileImport>) => {
                    grid.load(data)
                    sketch.redraw()
                })
            }
        })

        let context = canvas.elt.getContext('2d');
        context.imageSmoothingEnabled = false;

        for (let x = 0; x < 15;x++) {
            for (let y = 0; y < 15;y++) {
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
        for (let logoName in logoAssets) {
            const file = logoAssets[logoName]
            sketch.loadImage(`assets/${file}`,image => {
                newTileSpriteSheet(image,{
                    x: 2,
                    y: 2,
                    file: file
                },logoName)
            })
        }
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

    sketch.mouseClicked = () => {
        if (sketch.mouseButton == 'left') {
            grid.export(sketch)
        }
    }

}

new p5(sketchDefine).redraw()