export const PlayRegular: number[][] = [
  [25, 20],
  [80, 50],
  [80, 50],
  [25, 80],
  [25, 20],
];

export const PlayNone: number[][] = Array.from({ length: PlayRegular.length }, () => [50, 50]);

export const PlayStop: number[][] = [
  [25, 25],
  [75, 25],
  [75, 75],
  [25, 75],
  [25, 25],
];
