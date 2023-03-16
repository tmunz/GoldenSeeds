export class MathUtils {
  static goldenRatio = (1 + Math.sqrt(5)) / 2;

  static fib = (n: number) =>
    Math.round((1 / Math.sqrt(5)) * Math.pow(MathUtils.goldenRatio, n));

  static normalPdf = (x: number, mu: number, sigma: number) => {
    const sigma2 = Math.pow(sigma, 2);
    const numerator = Math.exp(-Math.pow((x - mu), 2) / (2 * sigma2));
    const denominator = Math.sqrt(2 * Math.PI * sigma2);
    return numerator / denominator;
  }
}
