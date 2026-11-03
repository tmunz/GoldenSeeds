import { findFreeNodePosition } from './GraphPlacement';

test('places a node at the preferred viewport location when it is free', () => {
  expect(findFreeNodePosition({ x: 100, y: 200 }, { width: 260, height: 320 }, [])).toEqual({ x: 100, y: 200 });
});

test('avoids existing nodes, including partially overlapping positions', () => {
  const occupied = [
    { x: 0, y: 0, width: 420, height: 800 },
    { x: 460, y: 0, width: 260, height: 320 },
    { x: -300, y: -200, width: 260, height: 320 },
  ];
  const size = { width: 420, height: 1200 };
  const result = findFreeNodePosition({ x: 100, y: 100 }, size, occupied);
  occupied.forEach(box => {
    expect(result.x + size.width + 40 <= box.x || result.x >= box.x + box.width + 40 ||
      result.y + size.height + 40 <= box.y || result.y >= box.y + box.height + 40).toBe(true);
  });
});

test('placement is deterministic for the same viewport and graph', () => {
  const occupied = [{ x: 0, y: 0, width: 400, height: 400 }];
  expect(findFreeNodePosition({ x: 100, y: 100 }, { width: 260, height: 320 }, occupied))
    .toEqual(findFreeNodePosition({ x: 100, y: 100 }, { width: 260, height: 320 }, occupied));
});
