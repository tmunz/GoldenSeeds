export const randomInt = (from: number = 0, to: number = 100, seed?: number): number => {
  if (typeof seed !== "undefined") {
    const mask = Number.MAX_SAFE_INTEGER;
    const a = (Math.sin(seed + 1337) * mask) & mask;
    return Math.abs(a) % (to - from + 1) + from;
  } else {
    return Math.floor(Math.random() * (to - from + 1)) + from;
  }
}