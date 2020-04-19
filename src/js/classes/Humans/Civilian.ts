import * as p5 from 'p5';
import Human from './Human';

export class Civilian extends Human {
  constructor(p: p5, _id: number, _position: p5.Vector) {
    super(p, _id, _position);
    // this.fill = this.p.color(200-this.sickness);
    // this.fill = this.p.color(255,100-this.sickness);
  }

  render() {
    if (this.sickness > 80) {
      this.fill = this.p.color(255 , 255 - this.sickness, 255 - this.sickness, 50 + this.health);
    } else {
      this.fill = this.p.color(255, 255, 255, 50 + this.health);
    }
    this.p.strokeWeight(this.pulseRadius);
    this.p.fill(this.fill);
    if (this.isColliding) {
      this.p.stroke(this.stroke);
    } else {
      this.p.noStroke();
    }
    super.render();
  }

  step(){
    super.step()
    if(this.sickness>80){this.sickness++;this.health-=0.2}
  }
}
