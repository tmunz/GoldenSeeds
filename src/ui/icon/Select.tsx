// Temporary selection icon, with matching points for all animation states.
export const SelectNone: number[][] = Array.from({ length: 9 }, () => [50, 50]);

export const SelectRegular: number[][] = [
  [10, 10], [90, 10], [90, 90], [10, 90], [10, 10],
  [10, 50], [90, 50], [50, 50], [50, 90],
];

export const SelectClose: number[][] = [
  [10, 10], [10, 10], [50, 50], [90, 90], [50, 50],
  [25, 75], [10, 90], [25, 75], [90, 10],
];
