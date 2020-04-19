import { Civilian } from './Civilian';
import * as p5 from 'p5';
import * as ml5 from '../../libraries/ml5';

export class Doctor extends Civilian {
  nn: any;
  score: number;
  fitness: number;
  closestNeighbour: number;
  closestNeighbourDist: number;
  subBetween:p5.Vector;
  thinking:boolean;
  constructor(p: p5, _id: number, _position: p5.Vector) {
    super(p, _id, _position);
    this.fill = p.color(0, 0, 255);
    // const options = {
    //   task: 'classification',
    //   inputs: ['distBetween', 'angleBetween','collisionAngle','isDoctor'],
    //   outputs: ['-1', '1', '0'],
    //   debug: true,
    //   noTraining: true,
    // };
    const options = {
        task: 'classification',
        inputs: ['pixel1','pixel2','pixel3','pixel4','pixel5','pixel6','pixel7','pixel8','pixel9','pixel10','pixel11','pixel12','pixel13','pixel14','pixel15','pixel17','pixel16', 'direction'],
        outputs: ['-1', '1', '0'],
        debug: true,
        noTraining: true,
      };
    this.nn = ml5.neuralNetwork(options);

    this.sickness = 0;
    this.health = 100;
    this.velocity = p.createVector(1, 1);
    this.velocity.rotate(p.random(0,360))
    this.score = 0;
    this.fitness = 0;
    this.closestNeighbour=0
    this.closestNeighbourDist=0
    this.subBetween=p.createVector(0,0);
    this.thinking=false;
  }

  process(id:number, distbetween:number,subBetween:p5.Vector){
    if(distbetween<this.closestNeighbourDist || !this.thinking){
        this.closestNeighbour=id;
        this.closestNeighbourDist=distbetween
        this.subBetween=subBetween;
        this.thinking=true
    }
  }
  // p:p5,angleBetween: number,collisionAngle:number,isDoctor:boolean OLD PARAMS
  think() {
    //   console.log('Im thiniking')
    // const nnInput = [this.closestNeighbourDist,angleBetween,collisionAngle,isDoctor];
    const d = Math.floor(this.p.pixelDensity());
    // const off =(Math.floor(this.position.x) + Math.floor(this.position.y) * Math.floor(this.p.width)) * d;
    this.p.loadPixels();
    // console.log(d)
    // console.log(this.p.pixels.length)
    // console.log(this.p.pixels[off+4])
    // this.p.noLoop()
    let nnInput=[];
    for(let nnPixelX=0;nnPixelX<5;nnPixelX++){
        for(let nnPixelY=0;nnPixelY<5;nnPixelY++){
            let pixelContainsHuman=0
            for(let subPixelX=0;subPixelX<10&&pixelContainsHuman!==1;subPixelX++){
                for(let subPixelY=0;subPixelY<10&&pixelContainsHuman!==1;subPixelY++){
                    if(subPixelY===3&&subPixelX===3){pixelContainsHuman=1;}
                    // tslint:disable-next-line: max-line-length
                    const off =Math.floor(this.position.x)-25+(subPixelX*nnPixelX+1) + ((Math.floor(this.position.y)-25+(subPixelY*nnPixelY+1)) * Math.floor(this.p.width)) * d;
                    if(this.p.pixels[off+4]!==0){
                     pixelContainsHuman=1
                    }
                }
            }
            nnInput.push(pixelContainsHuman)
        }
    }
    nnInput.push(this.velocity.heading())
    const results = this.nn.classifySync(nnInput);
    // console.log(results[0].label);
    if(Math.random()>0.999)console.log(results)
    this.turn(parseInt(results[0].label, 10));
    this.thinking=false;

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
    if(this.thinking===false){
        this.score++;
    }
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
    if(direction===0)this.score+=0.1;
    // this.score+=this.closestNeighbourDist*0.05;
  }
}
