export const SelectRegular: number[][] = [
  [25, 20],
  [ 0, 50],
  [25, 80],
  [25, 50],
  [75, 50],
  [75, 20],
  [100, 50],
  [75, 80],
];

export const SelectNone: number[][] = Array.from({ length: SelectRegular.length }, () => [50, 50]);

export const SelectClose: number[][] = [
  [10, 10],
  [50, 50],
  [10, 90], 
  [50, 50], 
  [50, 50],
  [90, 10], 
  [50, 50], 
  [90, 90], 
];
