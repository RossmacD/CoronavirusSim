import Human from '../Human';

export class Cell {
  id: number;
  x: number;
  y: number;
  humanKey: Array<number>;

  constructor(_id:number,_x: number, _y: number) {
    this.id = _id;
    this.x = _x;
    this.y = _y;
    // Index of humans currnetly in cell - break up?
    this.humanKey = [];
  }
}