# Gridlock Map

*Copied from else where*

the file is located in /assets/map.json <https://gridlock.explosivegaming.nl/map/assets/map.json>

* Main json is an array of "tile imports"
* Each tile must have at least a position {x: number, y: number} (values can be 0 or negative) and a size {x: number y: number} (given by width and height)

* If progress is not defined then it is 0 and the code does the reset; when setting keep this in mind:
  * 0 - 6 "offline and hidden" these nodes are the ones that fade to black; just let the script do this
  * 7 "offline" these nodes are the full blue ones; this will be the minimum you should use in the json
  * 8 "awaiting activation" these are the purple nodes; users can select these nodes and see the name
  * 9 - 16 "activating" these are the timer nodes to show that a node will start up soon
  * 17 "online" these are the yellow nodes that are the main ones to be used

* Inverted is false by default but can be used to fill the centre of the node to show something (like biter presence)
* logoName is a string which is the name of the logo; see above picture, logos must be on a 2x2 node
* Name is a string and by default is the X Y location of the node; can only been seen when selected
* regionColor is a hex string "#FF00FF" that controls the "area" colour for nodes; nodes with same colour will merge boarders
