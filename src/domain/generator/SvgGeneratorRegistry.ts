import { CartesianGrid } from './cartesian';
import { PolarGrid } from './polar';
import { Voronoi } from './voronoi';
import { Tree } from './tree';
import { SvgGenerator } from './SvgGenerator';
import { Shape } from './shape';
import { FunctionPlotter } from './function';
import { TextDrawer } from './text';
import { ShapeConfig } from './shape/ShapeDrawer';

export class SvgGeneratorRegistry {
  private registry: Map<string, () => SvgGenerator<unknown>> = new Map();

  constructor() {
    const classes = [Shape, FunctionPlotter, PolarGrid, CartesianGrid, Voronoi, Tree, TextDrawer];
    classes.forEach(c => this.register(c.type, () => new c()));
  }

  register(type: string, svgGeneratorCreator: () => SvgGenerator<unknown>) {
    this.registry.set(type, svgGeneratorCreator);
  }

  get types(): string[] {
    return [...this.registry.keys()];
  }

  newInstance(type: string): SvgGenerator<unknown> | null {
    const instance = this.registry.get(type);
    return instance ? instance() : null;
  }

  getDefaultGenerator(): SvgGenerator<ShapeConfig> {
    return new Shape();
  }
}

export const svgGeneratorRegistry = new SvgGeneratorRegistry();
