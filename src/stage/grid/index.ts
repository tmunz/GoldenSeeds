import { PolarGrid } from './PolarGrid';
import { Grid } from './Grid';
import { CartesianGrid } from './CartesianGrid';

export const gridByType = (type: string): Grid => {
  switch (type) {
  case 'cartesian':
    return new CartesianGrid();
  case 'polar':
  default:
    return new PolarGrid();
  }
}; 
