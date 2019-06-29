import p5 = require("p5");

function sketchDefine(sketch: p5) {

    sketch.setup = () => {
        sketch.createCanvas(sketch.windowWidth, sketch.windowHeight)
    }
    
    sketch.draw = () => {
        sketch.background(0)
        sketch.fill(255)
        sketch.rect(100,100,50,50)
    }

}

new p5(sketchDefine)