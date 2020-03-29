export {}; // ensure this is parsed as a module.


declare global {
  namespace jest {
    interface Matchers<R, T> {
      pointToBeCloseTo(expected: Point): R;
      pathToBeCloseTo(expected: Point[]): R;
    }
  }
}

const isSamePoint = (received: Point, expected: Point): boolean => {
  return Math.abs(received.x - expected.x) <= Math.pow(10, -3)
    && (Math.abs(received.y - expected.y) <= Math.pow(10, -3));
};

expect.extend({
  pointToBeCloseTo(received: Point, expected: Point) {
    const pass = isSamePoint(received, expected);
    if (pass) {
      return {
        message: () => `expected \n   ${JSON.stringify(received)} \nnot to be close to \n   ${JSON.stringify(expected)}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected \n   ${JSON.stringify(received)} \n to be close to \n   ${JSON.stringify(expected)}`,
        pass: false,
      };
    }
  },
  pathToBeCloseTo(received: Point[], expected: Point[]) {
    const pass = received.reduce((acc: boolean, actual, i) => acc && isSamePoint(actual, expected[i]), true);
    if (pass) {
      return {
        message: () => `expected \n   ${JSON.stringify(received)} \nnot to be close to \n   ${JSON.stringify(expected)}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected \n   ${JSON.stringify(received)} \n to be close to \n   ${JSON.stringify(expected)}`,
        pass: false,
      };
    }
  },
});
