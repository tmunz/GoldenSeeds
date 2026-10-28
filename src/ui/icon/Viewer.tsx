// Temporary preview icon, with matching points for all animation states.
export const ViewerNone: number[][] = Array.from({ length: 9 }, () => [50, 50]);

export const ViewerRegular: number[][] = [
  [5, 50], [25, 20], [75, 20], [95, 50], [75, 80],
  [25, 80], [5, 50], [50, 35], [50, 65],
];

export const ViewerClose: number[][] = [
  [10, 10], [10, 10], [50, 50], [90, 90], [50, 50],
  [25, 75], [10, 90], [25, 75], [90, 10],
];
