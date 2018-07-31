export namespace MathUtils {
    
    export const goldenRatio = (1 + Math.sqrt(5)) / 2;

    export const fib = (n: number) => Math.round(1 / Math.sqrt(5) * Math.pow(goldenRatio, n));
    
}