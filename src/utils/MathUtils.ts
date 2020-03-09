export class MathUtils {
    
    static goldenRatio = (1 + Math.sqrt(5)) / 2;

    static fib = (n: number) => Math.round(1 / Math.sqrt(5) * Math.pow(MathUtils.goldenRatio, n));
    
}
