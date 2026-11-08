export const PlusRegular: number[][] = [
  [10, 50],
  [90, 50],
  [50, 50],
  [50, 90],
  [50, 10],
];

export const PlusNone: number[][] = Array.from({ length: PlusRegular.length }, () => [50, 50]);

export const PlusRotated: number[][] = [
  [90, 50],
  [10, 50],
  [50, 50],
  [50, 90],
  [50, 10],
];
