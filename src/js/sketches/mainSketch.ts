import * as p5 from 'p5';
import Human from '../classes/Human';
import { Civilian } from '../classes/Civilian';
import { Cell } from '../classes/Enviroment/Cell';

// ---------------------------
// Global Variables
// ---------------------------
// let molecules, moleculeKey = [];
// let collisonNo,checknum = 0;
// let minRadius = 10, maxRadius = 20, minVelocity = -2, maxVelocity = 2, colWidth, rowHeight;
// An array of cells
const cells: Array<Cell> = [];
// An array of humans
let humans: Array<Human> = [];
const numHumans: number = 10;
let collisonNo: number = 0;
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
    Human.radiusMinMax = p.createVector(30, 30);
    // Generate grid objects
    generateGrid(p);
    // Generate initial humans
    generateMolecules(p);
    // gridifyHumans(p);
    p.noLoop();
    // console.log(cells);
  };

  p.draw = () => {
    p.background(0);
    // Split the molecules into their grids
    splitIntoGrids(p);
    checkCollisions(p)
    drawGrid(p);
    renderHumans(p);
  };
};

export default new p5(sketch);

/**
 * Generate the inital array of molecules
 */
function generateMolecules(p: p5) {
  humans = [];
  for (let i = 0; i < numHumans; i++) {
    humans.push(new Civilian(p, i, p.createVector(p.random(20,570), p.random(20,570))));
    // humans.push(new Civilian(p, i, p.createVector(290,260)));
    // console.log(humans[i].position)
  }
}

/**
 * Generate grid: creates the GridCell objects and pushes them into an array
 * @param p The context of p5
 */
function generateGrid(p: p5) {
  // Empty cells
  cells.length = 0;
  // Regen cells
  for (let x = 0; x < numCols; x++) {
    for (let y = 0; y < numRows; y++) {
      cells.push(new Cell(cells.length, x, y));
    }
  }
}

/**
 * Draw the grid in the background
 */
function drawGrid(p: p5) {
  for (let x: number = 0; x < p.width; x += colWidth) {
    for (let y = 0; y < p.height; y += rowHeight) {
      // Render Grid Lines
      p.stroke(80, 150, 50);
      p.strokeWeight(1);
      p.line(x, 0, x, p.height);
      p.line(0, y, p.width, y);
      // Text to show amount of humans in cell
      p.noStroke();
      p.fill(255, 255, 255, 255);
      p.textSize(16);
      p.textAlign(p.LEFT);
      const currentCell = x / colWidth + (y / rowHeight) * numCols;
      const text = cells[currentCell].humanKey.length;
      p.text(text, x + 5, y + 20);
    }
  }
}

/**
 * Evenly spread out the humans in a grid to avoid collisions after generation
 * @param p The context of p5
 */
function gridifyHumans(p: p5) {
  humans.forEach((human, indexValue) => {
    const humanSqrt = Math.ceil(Math.sqrt(humans.length));
    human.position.x = (p.width / (humanSqrt + 1)) * ((indexValue % humanSqrt) + 1);
    human.position.y = (p.height / (humanSqrt + 1)) * (Math.floor(indexValue / humanSqrt) + 1);
  });
}

/**
 * Render each human in the grid
 * @param p The context of p5
 */
function renderHumans(p: p5) {
  humans.forEach((human) => {
    human.render();
    human.checkEdges(p);
    human.step();
  });
}



function splitIntoGrids(p: p5) {
  generateGrid(p);
  humans.forEach((human) => {
    // Gets the x value by mapping the position of x to the amount of coloumns then flooring it
    // Gets Y value by mapping + flooring to amont of rows then multiplying by the number of coloums
    // Push the index to the box the molecule is in
    const currentXCell = Math.floor(human.position.x / colWidth);
    const currentYCell=Math.floor(human.position.y / rowHeight); 
    const yMapped = currentYCell * numCols;
    const currentCell = currentXCell + yMapped;

    // Push to cell
    cells[currentCell].humanKey.push(human.id);
    // Overlap Tests:
    // Check which half of the cell it is in, then check if it is closer to that edge than its radius, if so push to th
    /**
     * Check if within closest cells
     */
    // X Check
    const currentCellXStart = colWidth * currentXCell;
    let closestXCell=0;
    if (currentCell > 0 && human.position.x < currentCellXStart + human.radius) {
      closestXCell = -1;
      // currentCell+closestXCell<0?console.log(closestXCell, human.position.x,currentCell):
      cells[currentCell+closestXCell].humanKey.push(human.id);
    } else if (currentCell < numCols * numRows - 1 && human.position.x > currentCellXStart + colWidth - human.radius) {
      closestXCell = 1;
      // closestXCell>15?console.log(closestXCell, human.position.x,currentCell):
      cells[currentCell+closestXCell].humanKey.push(human.id);
    }

    // Y Check
    const currentCellYStart = rowHeight *currentYCell;
    let closestYCell = 0;
    if (currentCell > numCols && human.position.y < currentCellYStart + human.radius) {
       closestYCell = -numCols;
      // console.log(closestYCell)
      cells[currentCell+closestYCell].humanKey.push(human.id);
    } else if (currentCell < numCols * numRows - 1-numCols && human.position.y > (currentCellYStart+ rowHeight) - human.radius) {
          closestYCell = numCols;
      // console.log(cells[closestYCell])

        cells[currentCell+closestYCell].humanKey.push(human.id);
     }

     // Check if ball is in the corner
     if(closestYCell!==0&&closestXCell!==0){
      cells[currentCell+closestYCell+closestXCell].humanKey.push(human.id);
     }
  });
}


function checkCollisions(p:p5){
  collisonNo=0;
  cells.forEach(cell=>{
    if (cell.humanKey.length > 1) {
      for (let i = 0; i < cell.humanKey.length; i++) {
          for (let j = i + 1; j < cell.humanKey.length; j++) {
            // tslint:disable-next-line: max-line-length
            if (p5.Vector.sub(humans[cell.humanKey[i]].position, humans[cell.humanKey[j]].position).mag() < humans[cell.humanKey[i]].radius + humans[cell.humanKey[j]].radius) {
              humans[cell.humanKey[i]].isColliding = true;
              humans[cell.humanKey[j]].isColliding = true;
                  collisonNo++;
              }
          }
      }
  }
  })
  console.log(collisonNo);
}