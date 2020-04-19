import { Civilian } from './Civilian';
import * as p5 from 'p5';

export class Doctor extends Civilian {

  constructor(p: p5, _id: number, _position: p5.Vector) {
    super(p, _id, _position);
    this.fill = p.color(0, 0, 255);
    // this.sickness = 0;
    // this.health = 100;
    // this.velocity = p.createVector(1, 1);
    // this.velocity.rotate(p.random(0, 360));
  }



  step() {
    super.step();
  }

  render() {
    this.p.strokeWeight(this.pulseRadius);
    if (this.sickness > 80) {
        this.fill = this.p.color(255 - this.sickness , 255 ,0, 50 + this.p.constrain(this.health, 0, 100));
      } else {
        this.fill = this.p.color(0, 255, 0, 50 + this.p.constrain(this.health, 0, 100));
      }
    if (this.isColliding) {
      this.p.stroke(this.stroke);
    } else {
      this.p.noStroke();
    }
    this.p.fill(this.fill);
    this.p.push();
    this.p.translate(this.position.x, this.position.y);
    this.p.ellipse(0, 0, this.radius * 2, this.radius * 2);
    this.p.pop();
    this.isColliding = false;
  }
}
