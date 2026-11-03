import { GraphPosition } from '../model/GraphLayout';

export interface NodeBounds extends GraphPosition { width: number; height: number }

/** Find the nearest free position, leaving room for ports and connection labels. */
export function findFreeNodePosition(preferred: GraphPosition, size: { width: number; height: number }, occupied: NodeBounds[], gap = 40): GraphPosition {
  const candidates: GraphPosition[] = [preferred];
  occupied.forEach(box => {
    candidates.push(
      { x: box.x + box.width + gap, y: preferred.y },
      { x: box.x - size.width - gap, y: preferred.y },
      { x: preferred.x, y: box.y + box.height + gap },
      { x: preferred.x, y: box.y - size.height - gap },
    );
  });
  const clear = (position: GraphPosition) => occupied.every(box =>
    position.x + size.width + gap <= box.x || position.x >= box.x + box.width + gap ||
    position.y + size.height + gap <= box.y || position.y >= box.y + box.height + gap);
  candidates.sort((a, b) => Math.hypot(a.x - preferred.x, a.y - preferred.y) - Math.hypot(b.x - preferred.x, b.y - preferred.y));
  return candidates.find(clear) ?? {
    x: Math.max(preferred.x, ...occupied.map(box => box.x + box.width + gap)), y: preferred.y,
  };
}
