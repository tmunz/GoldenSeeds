import { PointsState } from './PointsState';

const points = [[1, 1], [2, 2], [3, 5.6]];

test.each([
  '[1,1], [2,2], [3,5.6]',
  '[[1,1], [2,2], [3,5.6]]',
  '[1,1],\n[2,2],\n[3,5.6]',
])('accepts point arrays in the format %s', async text => {
  const state = new PointsState();
  await state.setTextValue(text);
  expect(state.isValid()).toBe(true);
  expect(state.getValue()).toEqual(points);
  expect(state.getTextValue()).toBe(text);
});

test.each([
  ['[1,2]', [[1, 2]]], ['[]', []], ['[-2.5,1e2]', [[-2.5, 100]]],
])('accepts a single point, empty array, and decimal coordinates: %s', (text, expected) => {
  const state = new PointsState();
  state.setText(text as string);
  expect(state.isValid()).toBe(true);
  expect(state.getValue()).toEqual(expected);
});

test.each([
  '', '1,2', '[1]', '[1,2,3]', '[1,2],', '[[1,2],null]', '[[1,"2"]]', '[[true,2]]',
  '[[1e999,2]]', '[NaN,2]', '[Math.random(),2]', '{"x":1,"y":2}',
])('invalid or incomplete input preserves the last valid points: %s', text => {
  const state = new PointsState();
  state.setValue(points);
  state.setText(text);
  expect(state.isValid()).toBe(false);
  expect(state.getValue()).toEqual(points);
});

test('assigning point arrays copies the coordinates so callers cannot change saved state', () => {
  const input = [[1, 2]];
  const state = new PointsState();
  state.setValue(input);
  input[0][0] = 99;
  expect(state.getValue()).toEqual([[1, 2]]);
});
