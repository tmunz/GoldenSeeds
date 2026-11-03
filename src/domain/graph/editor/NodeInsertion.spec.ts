import { connectionsForAddedNode } from './NodeInsertion';
import { RENDER_NODE_ID, RENDER_NODE_KIND } from '../nodes/render/RenderNode';

test('a generator gets starter result connections only when the graph has no connections', () => {
  const node = { id: 'new-shape', kind: 'shape' };
  expect(connectionsForAddedNode(node, false)).toEqual(['points', 'svg', 'boundingBox'].map(port => ({
    id: `new-shape.${port}->${RENDER_NODE_ID}.${port}`,
    from: { nodeId: node.id, port },
    to: { nodeId: RENDER_NODE_ID, port },
  })));
  // Any existing connection, including one between ordinary nodes, prevents auto-connection.
  expect(connectionsForAddedNode(node, true)).toEqual([]);
});

test.each(['value:number', 'value:color', RENDER_NODE_KIND])('%s never auto-connects', kind => {
  expect(connectionsForAddedNode({ id: 'new', kind }, false)).toEqual([]);
});
