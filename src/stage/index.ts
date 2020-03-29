import { StageRegistry } from './StageRegistry';
import { RegularShape } from './regularShape';
import { Voronoi } from './voronoi';
import { CartesianGrid } from './CartesianGrid';
import { PolarGrid } from './PolarGrid';
import { Tree } from './tree';


export const stageRegistry = new StageRegistry();

stageRegistry.register('cartesian', () => new CartesianGrid());
stageRegistry.register('polar', () => new PolarGrid());

stageRegistry.register('regular-shape', () => new RegularShape());
stageRegistry.register('voronoi', () => new Voronoi());
stageRegistry.register('tree', () => new Tree());
