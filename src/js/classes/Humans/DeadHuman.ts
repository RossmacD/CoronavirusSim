import * as p5 from 'p5';
import Human from './Human';

export class DeadHuman extends Human {
   score:number;
    constructor(human:Human) {
        super(human.p, human.id, human.position);
        this.velocity=human.p.createVector(0,0)
        this.sickness=0;
        if(human.score){this.score=human.score}
      }
      render(){
        this.p.strokeWeight(5);
        this.p.fill(100,100,100,100);
        this.p.strokeWeight(1)
        this.p.stroke(this.stroke);
        super.render();
      }
}