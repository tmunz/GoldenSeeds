import { CartesianGrid } from './cartesian';
import { PolarGrid } from './polar';
import { RegularShape } from './regularShape';
import { Voronoi } from './voronoi';
import { Tree } from './tree';
import { SvgGenerator } from './SvgGenerator';

export class SvgGeneratorRegistry {

  private registry: Map<string, () => SvgGenerator> = new Map();

  constructor() {
    const classes = [CartesianGrid, PolarGrid, RegularShape, Voronoi, Tree];
    classes.forEach((c: any) => this.register(c.type, () => new c()));
  }

  register(type: string, svgGeneratorCreator: () => SvgGenerator) {
    this.registry.set(type, svgGeneratorCreator);
  }

  get types(): string[] {
    return [...this.registry.keys()];
  }

  newInstance(type: string): SvgGenerator | null {
    const instance = this.registry.get(type);
    return instance ? instance() : null;
  }

  getDefaultGenerator(): SvgGenerator {
    return new RegularShape() as SvgGenerator;
  }
}

export const svgGeneratorRegistry = new SvgGeneratorRegistry();
