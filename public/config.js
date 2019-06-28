// ment to be json but i got lazy trying to load it
const config  = {
    "graphic": {
        "scaleFactor": 2,
        "tileSize": 26,
        "verticalSprites": false,
        "assetsPath": "assets/lowRes/"
    },
    "__tiles_comment": "[xSize,ySize,spritePath]",
    "tiles": [
        [],
        [1,1,"tile000"],
        [2,1,"tile001"],
        [1,2,"tile002"],
        [2,2,"tile003"]
    ],
    "logos": [
        "logo000",
        "logo001",
        "logo002",
        "logo003",
        "logo004",
        "logo005",
        "logo006",
        "logo007",
        "logo008",
        "logo009"
    ],
    "connections": {
        "connectionFirstOffline": 1,
        "connectionFirstTimer": 2,
        "connectionFirstOnline": 3,
        "__tpyes_comment": "[minValue,maxValue,[connections]]",
        "types": [
            [0,6],
            [7,7,["connection000","connection000","connection000"]],
            [8,16,["connection000","connection000","connection002"]],
            [17,17,["connection000","connection002","connection001"]]
        ]
    }
}

module.exports = config