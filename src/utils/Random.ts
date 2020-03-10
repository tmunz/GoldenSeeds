export const randomInt = (from: number = 0, to: number = 100, seed?: number): number => {
  return Math.floor(random(Math.ceil(from), Math.floor(to) + 1, seed));
}

export const random = (min: number = 0, max: number = 1, seed?: number): number => {
  let n: number; // [0, 1[
  if (typeof seed !== "undefined") {
    n = Math.abs(Math.sin(seed + 5)) % 1;
  } else {
    n = Math.random();
  }
  return n * (max - min) + min;
}