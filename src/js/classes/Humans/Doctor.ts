import { Civilian } from './Civilian';
import * as p5 from 'p5';
import * as ml5 from '../../libraries/ml5';

export class Doctor extends Civilian {
  nn: any;
  score: number;
  fitness: number;
  constructor(p: p5, _id: number, _position: p5.Vector, nn?: any) {
    super(p, _id, _position);
    this.fill = p.color(0, 0, 255);
    const options = {
      task: 'classification',
      inputs: ['posMag','velMag','isDoctor'],
      outputs: ['-1', '1', '0'],
      debug: true,
      noTraining: true,
    };
    if (nn) {
      this.nn = nn;
      this.mutate();
    } else {
      this.nn = ml5.neuralNetwork(options);
        // this.nnLoad()
    }
    this.sickness = 0;
    this.health = 100;
    this.velocity = p.createVector(1, 1);
    this.score = 0;
    this.fitness = 0;
  }

  think(posMag: number,velMag:number,isDoctor:boolean) {
    const nnInput = [posMag,velMag,isDoctor];
    const results = this.nn.classifySync(nnInput);
    // console.log(results[0].label);
    this.turn(parseInt(results[0].label, 10));
  }

  nnLoad() {
    this.nn.load('../../../NeuralNet/collision/model.json', ()=>console.log('Loaded'));
  }

  nnSave() {
    this.nn.save();
  }

  setNN(nn:any){
    this.nn=nn;
    this.mutate();
  }

  step() {
    super.step();
    this.score++;
  }

  render() {
    this.p.strokeWeight(this.pulseRadius);
    this.p.fill(this.fill);
    if (this.isColliding) {
      this.p.stroke(this.stroke);
    } else {
      this.p.noStroke();
    }
    this.p.push();
    this.p.translate(this.position.x, this.position.y);
    this.p.ellipse(0, 0, this.radius * 2, this.radius * 2);
    this.p.pop();
    this.isColliding = false;
  }

  mutate() {
    // 10% mutation rate
    this.nn.mutate(0.1);
  }

  turn(direction:number){
    super.turn(direction);
    this.score+=0.1;
  }
}
