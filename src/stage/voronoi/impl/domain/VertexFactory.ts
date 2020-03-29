
import { Vertex } from './Vertex';
import { AbstractMemoryFactory } from '../utils/AbstractMemoryFactory';

export class VertexFactory extends AbstractMemoryFactory<Vertex> {

  create(x: number, y: number): Vertex {
    const vertex: Vertex = { x, y };
    this.memorize(vertex);
    return vertex;
  }

}
