import { Civilian } from './Civilian';
import * as p5 from 'p5';

export class Socialite extends Civilian {
    collisionAngle: number;
  closestNeighbourDist: number;
  closestNeighbour: number;
  oldClosestNeighbour: number;
  subBetween: p5.Vector;
  thinking: boolean;

  constructor(p: p5, _id: number, _position: p5.Vector) {
    super(p, _id, _position);
    this.fill = p.color(0, 0, 255);
    // this.sickness = 0;
    // this.health = 100;
    this.velocity = p.createVector(1, 1);
    this.velocity.rotate(p.random(0, 360));
    this.collisionAngle = 0;
    this.closestNeighbourDist = 0;
    this.closestNeighbourDist = 0;
    this.closestNeighbour = 0;
    this.oldClosestNeighbour = 0;
    this.subBetween = p.createVector(0, 0);
    this.thinking = false;
  }

process(id:number, distbetween: number, collisionAngle:number) {
    if (distbetween < this.closestNeighbourDist || !this.thinking) {
        this.oldClosestNeighbour=this.closestNeighbour;
      this.closestNeighbour = id;
      this.closestNeighbourDist = distbetween;
      this.collisionAngle=collisionAngle;
      this.thinking = true;
    }
  }


  think() {
      if(!this.thinking){return}
    // const angleBetween = this.subBetween.heading();
    if (this.collisionAngle < -1.57 || this.collisionAngle > 1.57) {
      this.turn(-this.collisionAngle);
    } else {
      this.turn(this.collisionAngle);
    }

    this.thinking = false;
  }

  step() {
    super.step();
  }

  render() {
    this.p.strokeWeight(this.pulseRadius);
    if (this.sickness > 80) {
        this.fill = this.p.color(255 - this.sickness , 255 - this.sickness, 255, 50 + this.health);
      } else {
        this.fill = this.p.color(0, 0, 255, 50 + this.health);
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
