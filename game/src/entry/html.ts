import { PIXI } from "../libs/pixi.js";

let type = "WebGL";
// @ts-ignore
if (!PIXI.utils.isWebGLSupported()) {
  type = "canvas";
}

// @ts-ignore
PIXI.utils.sayHello(type);

//Create a Pixi Application
// @ts-ignore
//Create a Pixi Application
let app = new PIXI.Application({
  width: 256,
  height: 256,
  antialias: true,
  transparent: false,
  resolution: 1,
});

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

//load an image and run the `setup` function when it's done
// @ts-ignore
PIXI.loader
  .add("../asset/card.png")
  .load(setup);

//This `setup` function will run when the image has loaded
function setup() {
  //Create the cat sprite
  // @ts-ignore
  let cat = new PIXI.Sprite(PIXI.loader.resources["../asset/card.png"].texture);

  //Add the cat to the stage
  app.stage.addChild(cat);
}
