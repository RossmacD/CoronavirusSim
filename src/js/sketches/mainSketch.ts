import * as p5 from 'p5';
import Human from '../classes/Humans/Human';
import { Civilian } from '../classes/Humans/Civilian';
import { Cell } from '../classes/Enviroment/Cell';

// ---------------------------
// Global Variables
// ---------------------------
// An array of cells
const cells: Array<Cell> = [];
// An array of humans
let humans: Array<Human> = [];
const numHumans: number = 100;
let collisonNo: number = 0;
const minRadius: number = 10;
const maxRadius: number = 10;
const numRows: number = 8;
const numCols: number = 8;
let colWidth: number;
let rowHeight: number;

// An instance of p5 -> represents one canvas
const sketch = (p: p5) => {
  /**
   * P5 Setup
   */
  p.setup = () => {
    // Set canavas to fill screen
    // p.createCanvas(p.windowWidth, p.windowHeight);
    p.createCanvas(p.windowHeight, p.windowHeight);
    // Generating colwidth and height must be done at runtime
    colWidth = p.width / numRows;
    rowHeight = p.height / numCols;
    // Set up draw properties
    p.background(0);
    p.stroke(80, 150, 50);
    p.strokeWeight(1);
    // Set min and max radius for humans
    Human.radiusMinMax = p.createVector(minRadius, maxRadius);
    // Generate grid objects
    generateGrid(p);
    // Generate initial humans
    generateMolecules(p);
    gridifyHumans(p);
    // p.noLoop();
    // console.log(cells);
  };

  p.draw = () => {
    p.background(0);
    // Split the molecules into their grids
    splitIntoGrids(p);
    // drawGrid(p);
    renderHumans(p);
    checkCollisions(p);
  };
};

export default new p5(sketch);

/**
 * Generate the inital array of molecules
 */
function generateMolecules(p: p5) {
  humans = [];
  for (let i = 0; i < numHumans; i++) {
    humans.push(new Civilian(p, i, p.createVector(p.random(20, 570), p.random(20, 570))));
    // humans.push(new Civilian(p, i, p.createVector(290,260)));
    humans[i].sickness = p.random(0, 100);
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
    const currentYCell = Math.floor(human.position.y / rowHeight);
    const yMapped = currentYCell * numCols;
    const currentCell = currentXCell + yMapped;

    // Push to cell
    cells[currentCell].humanKey.push(human.id);
    if (human.sickness > 80) {
      cells[currentCell].sicknessKey.push(human.id);
      const unique: Set<number> = new Set(cells[currentCell].sicknessKey);
      cells[currentCell].sicknessKey = [...unique];
    }
    if (human.dead) {
      cells[currentCell].deadKey.push(human.id);
      const unique: Set<number> = new Set(cells[currentCell].deadKey);
      cells[currentCell].deadKey = [...unique];
    }
    // Overlap Tests:
    // Check which half of the cell it is in, then check if it is closer to that edge than its radius, if so push to th
    /**
     * Check if within closest cells
     */
    // X Check
    const currentCellXStart = colWidth * currentXCell;
    let closestXCell = 0;
    if (currentCell > 0 && human.position.x < currentCellXStart + human.radius) {
      closestXCell = -1;
      // currentCell+closestXCell<0?console.log(closestXCell, human.position.x,currentCell):
      cells[currentCell + closestXCell].humanKey.push(human.id);
    } else if (currentCell < numCols * numRows - 1 && human.position.x > currentCellXStart + colWidth - human.radius) {
      closestXCell = 1;
      // closestXCell>15?console.log(closestXCell, human.position.x,currentCell):
      cells[currentCell + closestXCell].humanKey.push(human.id);
    }

    // Y Check
    const currentCellYStart = rowHeight * currentYCell;
    let closestYCell = 0;
    if (currentCell > numCols && human.position.y < currentCellYStart + human.radius) {
      closestYCell = -numCols;
      cells[currentCell + closestYCell].humanKey.push(human.id);
      cornerBall();
    } else if (currentCell < numCols * numRows - 1 - numCols && human.position.y > currentCellYStart + rowHeight - human.radius) {
      closestYCell = numCols;
      cells[currentCell + closestYCell].humanKey.push(human.id);
      cornerBall();
    }

    function cornerBall() {
      // Check if ball is in the corner
      if (closestYCell !== 0 && closestXCell !== 0) {
        cells[currentCell + closestYCell + closestXCell].humanKey.push(human.id);
      }
    }
  });
}

function checkCollisions(p: p5) {
  collisonNo = 0;
  cells.forEach((cell) => {
    if (cell.humanKey.length > 1) {
      for (let i = 0; i < cell.humanKey.length; i++) {
        for (let j = i + 1; j < cell.humanKey.length; j++) {
          const sub = p5.Vector.sub(humans[cell.humanKey[i]].position, humans[cell.humanKey[j]].position);
          p.stroke(255, 50);
          p.strokeWeight(2);
          // tslint:disable-next-line: max-line-length
          p.line(humans[cell.humanKey[i]].position.x, humans[cell.humanKey[i]].position.y, humans[cell.humanKey[j]].position.x, humans[cell.humanKey[j]].position.y);
          const mag = sub.mag();
          const combinedRadius = humans[cell.humanKey[i]].radius + humans[cell.humanKey[j]].radius;
          if (mag < combinedRadius) {
            // Seperate
            humans[cell.humanKey[i]].position.add(sub.normalize().mult(combinedRadius - Math.ceil(mag) + 1));
            // Sepertate balls
            const splitDist = (combinedRadius - mag) / 2;
            const splitVector = sub.copy().normalize().mult(splitDist);
            // humans[cell.humanKey[j]].position.add(splitVector);
            // humans[cell.humanKey[i]].position.sub(splitVector);

            // tslint:disable-next-line: max-line-length
            // Trading velocity https://www.quora.com/When-a-pool-ball-hits-another-ball-at-rest-why-does-the-original-pool-ball-stop-entirely-while-the-other-ball-launches-with-the-first-balls-speed
            const v1 = humans[cell.humanKey[i]].velocity;
            humans[cell.humanKey[i]].isColliding = true;
            humans[cell.humanKey[i]].velocity = humans[cell.humanKey[j]].velocity;
            humans[cell.humanKey[j]].isColliding = true;
            humans[cell.humanKey[j]].velocity = v1;
            if (humans[cell.humanKey[j]].sickness > 80 || humans[cell.humanKey[i]].sickness > 80) {
              if (humans[cell.humanKey[i]].sickness < 80) humans[cell.humanKey[i]].sickness += 5;
              if (humans[cell.humanKey[j]].sickness < 80) humans[cell.humanKey[j]].sickness += 5;
              // humans[cell.humanKey[j]].sickness+=5;
            }
            // get angle of distanceVect
            // const heading  = sub.heading();
            // const sine = p.sin(heading);
            // const cosine = p.cos(heading);

            collisonNo++;
          }
        }
      }
    }
  });
  // console.log('colliosons', collisonNo);
}

const statSketch = (p: p5) => {
  const padding = 20;
  const graphLines: Array<{ sick: number; dead: number }> = [];
  /**
   * P5 Setup
   */
  p.setup = () => {
    // Set canavas to fill screen
    // p.createCanvas(p.windowWidth, p.windowHeight);
    p.createCanvas(p.windowHeight, p.windowHeight);
    // Set up draw properties
    p.background(0);
    p.stroke(80, 150, 50);
    p.strokeWeight(1);
    // p.noLoop();
    // console.log(cells);
  };

  p.draw = () => {
    p.noStroke();
    p.background(120);
    p.fill(200, 40, 40);
    p.rect(0 + padding, 0 + padding, graphLines.length, p.height / 2);
    const amountSick = cells.reduce<number>((acc, key) => {
      return acc + key.sicknessKey.length;
    }, 0);
    const amountDead = cells.reduce<number>((acc, key) => {
      return acc + key.deadKey.length;
    }, 0);
    // console.log(amountSick, humans.length)
    if (graphLines.length > p.width - padding * 2) graphLines.shift();
    graphLines.push({ sick: amountSick, dead: amountDead });
    p.strokeWeight(1);
    for (let i: number = 0; i < graphLines.length; i++) {
      p.stroke(255, 100, 0);
      // tslint:disable-next-line: max-line-length
      p.line(0 + padding + i, 0 + padding, 0 + padding + i, p.height / 2 + (padding*2) - p.map(graphLines[i].dead || 0, 0, humans.length, padding, p.height / 2));
      p.stroke(0);
      // tslint:disable-next-line: max-line-length
      p.line(0 + padding + i, 0 + padding, 0 + padding + i, p.height / 2 + padding - p.map(graphLines[i].sick+graphLines[i].dead || 0, 0, humans.length, padding, p.height / 2));
    }
  };
};
export const p5StatSketch = new p5(statSketch);
