import { Stage } from './Stage';
import { drawerByType } from './drawer';
import { gridByType } from './grid';
import { backgroundByType } from './background';


// TODO move to individual stages
export const typesForStage = (stageId: string): string[] => {
  switch (stageId) {
  case 'grid': return ['polar', 'cartesian'];
  case 'drawer': return ['regular-shape', 'voronoi'];
  default: return [];
  }
};

export const stageByType = (stageId: string, type: string): Stage<any> => {
  switch (stageId) {
  case 'grid': return gridByType(type);
  case 'background': return backgroundByType(type);
  case 'drawer': return drawerByType(type);
  default: throw new Error('unknown stage');
  }
}; 
