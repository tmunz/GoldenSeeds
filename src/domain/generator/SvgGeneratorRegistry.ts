import { CartesianGrid } from './cartesian';
import { PolarGrid } from './polar';
import { Voronoi } from './voronoi';
import { Tree } from './tree';
import { SvgGenerator } from './SvgGenerator';
import { Shape } from './shape';
import { FunctionPlotter } from './function';
import { TextDrawer } from './text';

export class SvgGeneratorRegistry {
  private registry: Map<string, () => SvgGenerator> = new Map();

  constructor() {
    const classes = [Shape, FunctionPlotter, PolarGrid, CartesianGrid, Voronoi, Tree, TextDrawer];
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
    return new Shape() as SvgGenerator;
  }
}

export const svgGeneratorRegistry = new SvgGeneratorRegistry();
