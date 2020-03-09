import { Drawer } from './Drawer';
import { Voronoi } from './voronoi';
import { RegularShape } from './regularShape';

export const drawerByType = (type: string): Drawer => {
  switch (type) {
  case 'voronoi':
    return new Voronoi();
  case 'regular-shape':
  default:
    return new RegularShape();
  }
}; 
