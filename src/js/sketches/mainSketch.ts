import * as p5 from 'p5';
import Human from '../classes/Humans/Human';
import { Civilian } from '../classes/Humans/Civilian';
import { Cell } from '../classes/Enviroment/Cell';
import { DeadHuman } from '../classes/Humans/DeadHuman';
import { Doctor } from '../classes/Humans/Doctor';
import { Socialite } from '../classes/Humans/Socialite';

// ---------------------------
// Global Variables
// ---------------------------
// An array of cells
const cells: Array<Cell> = [];
// An array of humans
let humans: Array<Human> = [];
const numHumans: number = 50;
let collisonNo: number = 0;
// Editing these radius values will probably fuck everything
const minRadius: number = 10;
const maxRadius: number = 10;
const numRows: number = 9;
const numCols: number = 9;
let colWidth: number;
let rowHeight: number;
let doctors: Array<Doctor | Human>;
let doctorKey: Array<number>;
// An instance of p5 -> represents one canvas
const sketch = (p: p5) => {
  /**
   * P5 Setup
   */
  p.setup = () => {
    // Set canavas to fill screen
    // p.createCanvas(p.windowWidth, p.windowHeight);
    p.createCanvas(p.windowWidth / 2, p.windowHeight);
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
    p.frameRate(200);
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
  doctors = [];
  doctorKey = [];
  for (let i = 0; i < numHumans; i++) {
    // humans.push(new Civilian(p, i, p.createVector(p.random(20, 570), p.random(20, 570))));
    const rand = p.random();
    if (rand > 0.2 || doctors.length > 1) {
      humans.push(new Civilian(p, i, p.createVector(p.random(20, 570), p.random(20, 570))));
    } else if (rand > 0.05) {
      humans.push(new Socialite(p, i, p.createVector(p.random(20, 570), p.random(20, 570))));
    } else {
      humans.push(new Doctor(p, i, p.createVector(p.random(20, 570), p.random(20, 570))));
    }
  }
}

// function regenerateMolecules(p: p5, bestDoctorId: number) {
//   generation++;
//   console.log('GENERATION: ', generation);
//   console.log(doctors);
//   console.log(bestDoctorId);
//   // Save the model

//   if (humans[bestDoctorId].score > highscore) {
//     console.log('new Highscore');
//     bestDoctor = humans[bestDoctorId].nn;
//     highscore = humans[bestDoctorId].score;
//     console.log(humans[bestDoctorId], humans[bestDoctorId].nn, bestDoctor);
//   } else {
//     // If not a highscore breed old best with highest from this generation
//     bestDoctor = bestDoctor.crossover(humans[bestDoctorId].nn);
//     console.log('crossingover');
//   }
//   if (generation % 50 === 0) new Doctor(p, 100, p.createVector(100, 100), bestDoctor).nnSave();
//   generateGrid(p);
//   humans = [];
//   doctors = [];
//   doctorKey = [];
//   for (let i = 0; i < numHumans; i++) {
//     if (p.random() > 0.3) {
//       humans.push(new Civilian(p, i, p.createVector(p.random(20, 570), p.random(20, 570))));
//     } else {
//       humans.push(new Doctor(p, i, p.createVector(p.random(20, 570), p.random(20, 570))));
//       humans[i].setNN(bestDoctor);
//       doctors.push(humans[i]);
//     }
//     humans[i].sickness = p.random(0, 100);
//   }
// }

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
    if (human.constructor.name === Socialite.name) {
      human.think();
    }
    human.step();
    human.checkEdges(p);
  });
}

function splitIntoGrids(p: p5) {
  generateGrid(p);
  humans.forEach((human) => {
    if (human.health < 0) {
      humans[human.id] = new DeadHuman(human);
    }
    // Gets the x value by mapping the position of x to the amount of coloumns then flooring it
    // Gets Y value by mapping + flooring to amont of rows then multiplying by the number of coloums
    // Push the index to the box the molecule is in
    const currentXCell = Math.floor(human.position.x / colWidth);
    const currentYCell = Math.floor(human.position.y / rowHeight);
    const yMapped = currentYCell * numCols;
    const currentCell = currentXCell + yMapped;

    // Push to cell
    cells[currentCell].humanKey.push(human.id);
    human.currentCells.push(currentCell);

    if (human.sickness > 80) {
      cells[currentCell].sicknessKey.push(human.id);
      const unique: Set<number> = new Set(cells[currentCell].sicknessKey);
      cells[currentCell].sicknessKey = [...unique];
    }
    if (human.constructor.name === DeadHuman.name) {
      cells[currentCell].deadKey.push(human.id);
      const unique: Set<number> = new Set(cells[currentCell].deadKey);
      cells[currentCell].deadKey = [...unique];
    }
    if (human.constructor.name === Doctor.name) {
      doctorKey.push(human.id);
    }
    // Overlap Tests:
    // Check which half of the cell it is in, then check if it is closer to that edge than its radius, if so push to th
    // X Check
    const currentCellXStart = colWidth * currentXCell;
    let closestXCell = 0;
    if (currentCell > 0 && human.position.x < currentCellXStart + human.radius) {
      closestXCell = -1;
      // currentCell+closestXCell<0?console.log(closestXCell, human.position.x,currentCell):
      cells[currentCell + closestXCell].humanKey.push(human.id);
      human.currentCells.push(currentCell + closestXCell);
    } else if (currentCell < numCols * numRows - 1 && human.position.x > currentCellXStart + colWidth - human.radius) {
      closestXCell = 1;
      // closestXCell>15?console.log(closestXCell, human.position.x,currentCell):
      cells[currentCell + closestXCell].humanKey.push(human.id);
      human.currentCells.push(currentCell + closestXCell);
    }

    // Y Check
    const currentCellYStart = rowHeight * currentYCell;
    let closestYCell = 0;
    if (currentCell > numCols && human.position.y < currentCellYStart + human.radius) {
      closestYCell = -numCols;
      cells[currentCell + closestYCell].humanKey.push(human.id);
      human.currentCells.push(currentCell + closestYCell);
      cornerBall();
    } else if (currentCell < numCols * numRows - 1 - numCols && human.position.y > currentCellYStart + rowHeight - human.radius) {
      closestYCell = numCols;
      cells[currentCell + closestYCell].humanKey.push(human.id);
      human.currentCells.push(currentCell + closestYCell);
      cornerBall();
    }

    function cornerBall() {
      // Check if ball is in the corner
      if (closestYCell !== 0 && closestXCell !== 0) {
        cells[currentCell + closestYCell + closestXCell].humanKey.push(human.id);
        human.currentCells.push(currentCell + closestYCell + closestXCell);
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
          const humanId1 = cell.humanKey[i];
          const humanId2 = cell.humanKey[j];
          const distBetweenVect = p5.Vector.sub(humans[humanId1].position, humans[humanId2].position);
          const distBetweenMag = distBetweenVect.copy().mag();

          // Draw lien between
          p.stroke(255, 50);
          p.strokeWeight(2);
          // tslint:disable-next-line: max-line-length
          p.line(humans[humanId1].position.x, humans[humanId1].position.y, humans[humanId2].position.x, humans[humanId2].position.y);

          if (humans[humanId1].constructor.name === Socialite.name) {
            if (humans[humanId2].sickness > 80) {
              humans[humanId2].sickness = 80;
            }
            // tslint:disable-next-line: max-line-length
            const collisionAngle = p5.Vector.sub(humans[humanId1].position, p5.Vector.add(humans[humanId2].position, humans[humanId2].velocity)).heading();
            humans[humanId1].process(humans[humanId2].id, distBetweenMag, collisionAngle);
          }
          if (humans[cell.humanKey[j]].constructor.name === Socialite.name) {
            humans[humanId2].sickness -= 2;
            // tslint:disable-next-line: max-line-length
            const collisionAngle = p5.Vector.sub(humans[humanId2].position, p5.Vector.add(humans[humanId1].position, humans[humanId1].velocity)).heading();
            humans[humanId2].process(humans[humanId1].id, distBetweenMag, collisionAngle);
          }

          const combinedRadius = humans[humanId1].radius + humans[humanId2].radius;
          if (distBetweenMag < combinedRadius) {
            handleCollision(humanId1, humanId2, distBetweenVect, combinedRadius, distBetweenMag);
            collisonNo++;
          }
        }
      }
    }
  });
}

function handleCollision(humanId1: number, humanId2: number, distBetweenVect: p5.Vector, combinedRadius: number, distBetweenMag: number) {
  // Seperate the balls
  humans[humanId1].position.add(
    distBetweenVect
      .copy()
      .normalize()
      .mult(combinedRadius - Math.ceil(distBetweenMag) + 1)
  );

  // tslint:disable-next-line: max-line-length
  // Trading velocity https://www.quora.com/When-a-pool-ball-hits-another-ball-at-rest-why-does-the-original-pool-ball-stop-entirely-while-the-other-ball-launches-with-the-first-balls-speed
  const v1 = humans[humanId1].velocity;
  humans[humanId1].isColliding = true;
  humans[humanId1].velocity = humans[humanId2].velocity;
  humans[humanId2].isColliding = true;
  humans[humanId2].velocity = v1;
  if (humans[humanId2].sickness > 80 || humans[humanId1].sickness > 80) {
    if (humans[humanId1].sickness < 80) humans[humanId1].sickness += 10;
    if (humans[humanId2].sickness < 80) humans[humanId2].sickness += 10;
  }
}

const statSketch = (p: p5) => {
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
    p.rect(0, 0, graphLines.length, p.height / 2);
    const amountSick = cells.reduce<number>((acc, key) => {
      return acc + key.sicknessKey.length;
    }, 0);
    const amountDead = cells.reduce<number>((acc, key) => {
      return acc + key.deadKey.length;
    }, 0);
    // console.log(amountSick, humans.length)
    if (graphLines.length > p.width) graphLines.shift();
    // graphLines.push({ sick: 10, dead: 10 });
    graphLines.push({ sick: amountSick, dead: amountDead });
    // graphLines.push({ sick: 0 , dead: humans.length });
    p.strokeWeight(1);
    for (let i: number = 0; i < graphLines.length; i++) {
      p.stroke(255, 100, 0);
      // p.stroke(0,80);
      // tslint:disable-next-line: max-line-length
      p.line(i, 0, 0 + i, p.height / 2 - p.map(graphLines[i].dead || 0, 0, humans.length, 0, p.height / 2));
      p.stroke(0);
      // tslint:disable-next-line: max-line-length
      p.line(i, 0, i, p.height / 2 - p.map(graphLines[i].dead + graphLines[i].sick || 0, 0, humans.length, 0, p.height / 2));
      // p.noLoop()
    }
  };
};
export const p5StatSketch = new p5(statSketch);
