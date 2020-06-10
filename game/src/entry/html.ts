import { PIXI } from "../libs/pixi.js";

let type = "WebGL";
// @ts-ignore
if (!PIXI.utils.isWebGLSupported()) {
  type = "canvas";
}

// @ts-ignore
PIXI.utils.sayHello(type);
