import { getBezierPath, Position } from '@xyflow/react';
import { connectionMidpointAngle } from './ConnectionGeometry';

function angle(sourceX: number, sourceY: number, targetX: number, targetY: number) {
  return connectionMidpointAngle(getBezierPath({ sourceX, sourceY, targetX, targetY,
    sourcePosition: Position.Right, targetPosition: Position.Left })[0]);
}

test('horizontal and vertical connections align the eye with their center tangent', () => {
  expect(angle(0, 0, 100, 0)).toBe(0);
  expect(angle(0, 0, 0, 100)).toBe(90);
});

test('bent connections use the curve tangent rather than the endpoint slope', () => {
  expect(angle(0, 0, 100, 100)).toBeCloseTo(63.4349488);
  expect(angle(0, 100, 100, 0)).toBeCloseTo(-63.4349488);
});

test('backward connections follow the returning curve and coincident endpoints stay finite', () => {
  expect(angle(100, 0, 0, 100)).toBeGreaterThan(90);
  expect(Number.isFinite(angle(0, 0, 0, 0))).toBe(true);
});
