export const ViewerRegular: number[][] = [
  [50,  5],
  [ 5, 50],
  [50, 95],
  [50, 95],
  [50, 95],
  [95, 50],
  [50,  5],
];

export const ViewerNone: number[][] = Array.from({ length: ViewerRegular.length }, () => [50, 50]);

export const ViewerClose: number[][] = [
  [10, 10],
  [50, 50],
  [10, 90],
  [50, 50],
  [90, 90],
  [50, 50],
  [90, 10],
];
