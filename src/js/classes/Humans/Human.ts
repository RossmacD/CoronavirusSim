// import {Color,Vector} from'p5';
import * as p5 from 'p5';
export default abstract class Human {
  // Static Variables: Shared between all instaces of the class
  static radiusMinMax: p5.Vector;
  // Context
  p: p5;
  /* Physical*/
  id: number;
  position: p5.Vector;
  velocity: p5.Vector;
  radius: number;
  fill: p5.Color;
  stroke: p5.Color;

  // traits
  isColliding: boolean;
  age: number;
  sickness: number;
  health: number;
  immunity: number;
  asymptomatic: boolean;
  pulseRadius: number;
  pulseRadiusMax: number;
  pulseSpeed: number;
  dead:boolean;

  constructor(_p: p5, _id: number, _position: p5.Vector) {
    this.p = _p;
    this.id = _id;
    this.position = _position;
    this.fill = this.p.color(255, 255, 255);
    this.stroke = this.p.color(255, 255, 255);
    this.radius = this.p.random(Human.radiusMinMax.x, Human.radiusMinMax.y);
    this.velocity = this.p.createVector(this.p.random(-2, 2), this.p.random(-2, 2));
    // Pulse represents the contagion
    this.pulseRadius = 1;
    this.pulseRadiusMax = 15;
    this.pulseSpeed = 1;
    /* Collision*/
    this.isColliding = false;
    // this.bounce = false;
    // Number between 0 and 8 representing the closest corner or edge
    // this.closestEdge=0;
    this.dead=false;
    /* Health*/
    this.age = this.p.random(10, 90);
    this.health = 100 / this.p.random();
    this.sickness = this.p.random(0,100);
    // After a successful recovery from the virus you may have immunity for a period, immunity can also be gotten by
    // wahsing hands and so on
    // https://www.nbcnews.com/health/health-news/can-you-catch-coronavirus-twice-you-ll-probably-be-immune-n1171976
    this.immunity = 20;
    // You might no show symptoms to other viruses, you can still transmit the virus
    this.asymptomatic = Math.random() < 0.5;
  }

  render() {
    if(!this.dead&&this.health<0){
        this.die();
    }
    this.p.strokeWeight(this.pulseRadius);
    this.p.fill(this.fill);
    if (this.isColliding||this.dead) {
    //   this.pulseRadius > this.pulseRadiusMax ? this.pulseRadius += this.pulseSpeed : this.pulseRadius = this.pulseRadius = 0;
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

  step() {
    this.position.add(this.velocity);
    if(this.sickness>80){this.sickness++;this.health-=this.sickness*0.0005}
  }

  checkEdges(p: p5) {
    // if bouncing on walls && this.velocity.x < 0
    if ((this.position.x < this.radius && this.velocity.x < 0) || (this.position.x > p.width - this.radius && this.velocity.x > 0)) {
      this.velocity.x = this.velocity.x * -1;
    }

    if ((this.position.y < this.radius && this.velocity.y < 0) || (this.position.y > p.height - this.radius && this.velocity.y > 0)) {
      this.velocity.y = this.velocity.y * -1;
    }
  }

  // reset(){

  // }
  die(){
      this.velocity.x=0;
      this.velocity.y=0;
      this.sickness=0;
      this.dead=true;
  }
}
