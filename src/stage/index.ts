import { StageRegistry } from './StageRegistry';
import { CircleBackground } from './background/CircleBackground';
import { RegularShape } from './drawer/regularShape';
import { Voronoi } from './drawer/voronoi';
import { CartesianGrid } from './grid/CartesianGrid';
import { PolarGrid } from './grid/PolarGrid';
import { Tree } from './drawer/tree';


export const stageRegistry = new StageRegistry();

stageRegistry.register('background', 'circle', () => new CircleBackground());

stageRegistry.register('grid', 'cartesian', () => new CartesianGrid());
stageRegistry.register('grid', 'polar', () => new PolarGrid());

stageRegistry.register('drawer', 'regular-shape', () => new RegularShape());
stageRegistry.register('drawer', 'voronoi', () => new Voronoi());
stageRegistry.register('drawer', 'tree', () => new Tree());
