import * as p5 from 'p5';
import Human from './Human';

export class Civilian extends Human {

  constructor(p: p5, _id: number, _position: p5.Vector) {
    super(p, _id, _position);
  }
}
