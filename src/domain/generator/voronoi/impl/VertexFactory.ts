import { AbstractMemoryFactory } from './utils/AbstractMemoryFactory';
import { Point } from '../../../../datatypes/Point';

export class VertexFactory extends AbstractMemoryFactory<Point> {
  create(x: number, y: number): Point {
    const vertex: Point = [x, y];
    this.memorize(vertex);
    return vertex;
  }
}
