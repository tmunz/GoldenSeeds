import { Background } from './Background';
import { CircleBackground } from './CircleBackground';

export const backgroundByType = (type: string): Background => {
  switch (type) {
  case 'circle':
  default:
    return new CircleBackground();
  }
}; 
