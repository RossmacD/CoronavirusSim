import * as p5 from 'p5';
import Human from '../classes/Human';
import { Civilian } from '../classes/Civilian';

// ---------------------------
// Global Variables
// ---------------------------
// let molecules, moleculeKey = [];
// let collisonNo,checknum = 0;
// let minRadius = 10, maxRadius = 20, minVelocity = -2, maxVelocity = 2, colWidth, rowHeight;
let humans: Array<Human> = [];
const numHumans:number=20;
// let humanKey: Array<Array<number>> = [];
// let collisonNo: number = 0;
// let checknum:number = 0;
const minRadius: number = 10;
const maxRadius: number = 20;
const numRows: number = 4;
const numCols: number = 4;
let colWidth: number;
let rowHeight: number;

// Create an object to hold Variables for gui.
// GUI cannot get handle on scope otherwise, unless var is used (Undesirable as it is outdated)
// let guiVars: object = {
//   numOfMolecules: 1,
//   numRows: 4,
//   numCols: 4,
//   radiusBaseline: 5,
//   showGrid: true,
//   render: true,
//   showTrails: false
// };

const sketch = (p: p5) => {
  /**
   * P5 Setup
   */
  p.setup = () => {
    // Set canavas to fill screen
    // p.createCanvas(p.windowWidth, p.windowHeight);
    p.createCanvas(600, 600);
    // Generating colwidth and height must be done at runtime
    colWidth = p.width / numRows;
    rowHeight = p.height / numCols;
    // Set up draw properties
    p.background(0);
    p.stroke(80, 150, 50);
    p.strokeWeight(1);
    // Set min and max radius for humans
    Human.radiusMinMax=p.createVector(30,30);
    // Generate initial humans
    generateMolecules(p);
    gridifyHumans(p);
  };

  p.draw = () => {
    p.background(0);
    drawGrid(p);
    renderHumans(p);
  };
};

export default new p5(sketch);

/**
 * Generate the inital array of molecules
 */
function generateMolecules(p:p5){
    humans = [];
    for (let i = 0; i < numHumans; i++) {
      humans.push(new Civilian(p, i, p.createVector(100,100)));
    }
}


/**
 * Draw the grid in the background
 */
function drawGrid(p: p5) {
  for (let x: number = colWidth; x < p.width; x += colWidth) {
    for (let y = 0; y < p.height; y += rowHeight) {
      // Render Grid Lines
      p.stroke(80, 150, 50);
      p.strokeWeight(1);
      p.line(x, 0, x, p.height);
      p.line(0, y, p.width, y);
      // Text to show amount of humans in cell
      const currentGridCell = x / colWidth - 1;
    }
  }
//   // Draw Grid
//   for (let x: number = colWidth; x < p.width; x += colWidth) {
//     for (let y: number = 0; y < p.height; y += rowHeight) {
//       // p.stroke(80, 150, 50);
//       p.stroke(52, 235, 100);
//       p.strokeWeight(1);
//       p.line(x, 0, x, p.height);
//       p.line(0, y, p.width, y);
//       // console.log(currentGridCell);
//       // console.log(humanKey[currentGridCell]);

//       let numArray: number = humanKey[x / colWidth - 1 + y / rowHeight].length;
//       // tempArray.forEach(function (indexValue) {
//       //     if (molecules[indexValue].intersecting == true) {
//       //         intersectCount++
//       //     }
//       // })
//       if (numArray === 0) {
//         // numArray = ""
//       }
//       p.noStroke();
//       p.fill(255, 255, 255, 255);
//       p.textSize(16);
//       p.textAlign(p.RIGHT);
//       // text(numArray, x - 5, y + 20);

//       // fill(255, 50, 0, 150);
//       // text(intersectCount, j * gridWidth + gridWidth - 5, i * gridHeight + gridHeight - 5);
//     }
//   }
}


/**
 * Render each human in the grid
 */
function renderHumans(p:p5) {
    humans.forEach((human) => {
        human.render();
        human.checkEdges(p);
        human.step();
    });
}

function gridifyHumans(p:p5){
  humans.forEach((human, indexValue)=>{
    const humanSqrt =Math.ceil(Math.sqrt(humans.length));
    human.position.x = (p.width / (humanSqrt + 1)) * ((indexValue% (humanSqrt))+1);
    human.position.y = (p.height / (humanSqrt +1)) * (Math.floor(indexValue / humanSqrt) + 1);
  });
}