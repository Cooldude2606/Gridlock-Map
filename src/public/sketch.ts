import p5 = require("p5");
import "p5/lib/addons/p5.dom"
import { Range, TileImport, Position } from "../lib/defines";
import { tileAssets, connectionAssets, logoAssets, renderSettings, pixelToTile, tileToPixel } from "./config";
import { newTileSpriteSheet, newConnectionSpriteSheet } from "../entities/asset";
import { Grid } from "../entities/grid";
import { Tile } from "../entities/tile";

function sketchDefine(sketch: p5) {

    const grid = new Grid()

    let selected: Tile
    let font: p5.Font
    let cursor: p5.Image
    let canvas: p5.Renderer
    let center: Position
    let offset: Position = {x: 0, y:0}
    let scale: number = renderSettings.scale

    sketch.setup = () => {
        canvas = sketch.createCanvas(sketch.windowWidth, sketch.windowHeight)
        sketch.frameRate(30)
        //sketch.noLoop()

        sketch.textFont(font)
        sketch.textSize(renderSettings.textSize)
        sketch.textAlign(sketch.LEFT, sketch.TOP)

        canvas.drop(file => {
            if (file.subtype == 'json') {
                sketch.loadJSON(file.data,(data: Array<TileImport>) => {
                    grid.load(data)
                    grid.newTileBuffers(sketch)
                    grid.newBuffer(sketch)
                    sketch.redraw()
                })
            }
        })

        const context = canvas.elt.getContext('2d');
        context.imageSmoothingEnabled = false;

        center = {x: sketch.windowWidth/2, y: sketch.windowHeight/2}

        if (process.env.NODE_ENV === 'production') {
            sketch.loadJSON('assets/map.json', (data: Array<TileImport>) => {
                grid.load(data)
                grid.newTileBuffers(sketch)
                grid.newBuffer(sketch)
                sketch.redraw()
            })

        } else {
            for (let x = 0; x < 15;x++) {
                for (let y = 0; y < 15;y++) {
                    const tile = grid.newTile({x:x,y:y},{x:1,y:1})
                    const ran = Math.random()
                    if (ran < 0.95) tile.progress = 0; else
                    if (ran < 0.98) tile.progress = 8
                    else tile.progress = 18
                }
            }

            grid.calculateProgressAll()
            grid.newBuffer(sketch)
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

        cursor = sketch.loadImage('assets/cursor-boxes.png')
        font = sketch.loadFont('assets/DejaVuSans.ttf')
    }
    
    sketch.draw = () => {
        sketch.background(0)
        sketch.translate(center.x,center.y)
        sketch.scale(scale)
        grid.draw(sketch)
        if (selected && selected.progress >= renderSettings.allowSelectionAtProgress) {
            const rawTilePosition = selected.position
            const tilePosition = tileToPixel(rawTilePosition)
            const rawTileSize = selected.size
            const tileSize = tileToPixel(rawTileSize)
            const px = tilePosition.x-grid.center.x
            const py = tilePosition.y-grid.center.y
            sketch.image(cursor,px-(4.5*rawTileSize.x),py-(4.5*rawTileSize.y),tileSize.x+(9*rawTileSize.x),tileSize.y+(9*rawTileSize.y),0,0,64,64)
            sketch.fill(renderSettings.textBackground)
            sketch.stroke(renderSettings.textBackgroundOutline)
            sketch.rect(px+5,py+5,sketch.textWidth(selected.name)+4,renderSettings.textSize+4)
            sketch.fill(renderSettings.textColour)
            sketch.noStroke()
            sketch.text(selected.name,px+7,py+7)
        }
    }

    sketch.doubleClicked = () => {
        // possible way to join game?
    }

    sketch.mousePressed = () => {
        offset.x = sketch.mouseX - center.x
        offset.y = sketch.mouseY - center.y
    }

    sketch.mouseDragged = () => {
        center.x = sketch.mouseX - offset.x
        center.y = sketch.mouseY - offset.y
    }

    sketch.mouseWheel = (event: any) => {
        const centerDelta = event.delta/20
        const scaleDelta = 1-centerDelta
        const oldScale = scale
        scale *= scaleDelta
        scale = scale < 0.5 ? 0.5 : Math.floor(scale*100)/100
        scale = scale > 5 ? 5 : scale
        if (scale  != oldScale) {
            center.x -= Math.floor((center.x - sketch.mouseX)*centerDelta)
            center.y -= Math.floor((center.y - sketch.mouseY)*centerDelta)
        }
    }

    sketch.mouseMoved = () => {
        const mouseX = sketch.mouseX-center.x+(grid.center.x*scale)
        const mouseY = sketch.mouseY-center.y+(grid.center.y*scale)
        const tilePosition = pixelToTile({
            x: mouseX/scale,
            y:  mouseY/scale
        })
        selected = grid.getTile(tilePosition)
    }

    sketch.windowResized = () => {
        sketch.resizeCanvas(sketch.windowWidth, sketch.windowHeight)
    }

}

new p5(sketchDefine)