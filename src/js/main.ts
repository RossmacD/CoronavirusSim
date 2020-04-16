/*************************************************************
*   MAIN.TS
*   This file is the main entrypoint Typescript file which bootstraps the html and css also
*   I decided to to it in this way rather than directly bundling the sketch as it allows it to be more modulur in the future
*
*   Webpack on its own is a bit overkill and adds some developemnt overhead but allows code to be moved into a Webpacked React
*   or Vue project for example
*
*
/*************************************************************
*/

// Import HTML for webpack
import '../index.html';
// Import CSS for webpack
import '../css/style.css';
// Import P5 Sketch
import './sketches/mainSketch'




