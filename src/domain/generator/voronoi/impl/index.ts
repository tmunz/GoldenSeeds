export { Boundary } from './domain/Boundary';
import { Cell as VoronoiCell } from './datatypes/Cell';
import { Edge as VoronoiEdge } from './datatypes/Edge';
import { Point as VoronoiPoint } from './datatypes/Point';
export { Voronoi } from './Voronoi';

export type Cell = VoronoiCell;
export type Edge = VoronoiEdge;
export type Point = VoronoiPoint;
