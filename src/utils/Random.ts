
export const random = (min = 0, max = 1, seed?: number): number => {
  let n: number; // [0, 1[
  if (typeof seed !== 'undefined') {
    // Mulberry32
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    n = ((t ^ t >>> 14) >>> 0) / 0xFFFFFFFF;
  } else {
    n = Math.random();
  }
  return n * (max - min) + min;
};

export const randomInt = (from = 0, to = 100, seed?: number): number => {
  return Math.floor(random(Math.ceil(from), Math.floor(to) + 1, seed));
};

export const randomColor = (seed: number): number => {
  const min = 0;
  const max = 0xffffff;
  const rand = Math.abs(Math.sin(seed + 5)) % 1;
  return Math.floor(rand * (max - min) + min + 1);
};
