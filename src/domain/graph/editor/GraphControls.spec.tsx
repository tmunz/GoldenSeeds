import { GraphControls } from './GraphControls';

const mockFitView = jest.fn((options: { nodes: { id: string }[] }) => Promise.resolve(options.nodes.length > 0));
let mockNodes: { id: string; selected: boolean }[] = [];
let mockInteractive = true;
const mockSetState = jest.fn();

jest.mock('@xyflow/react', () => ({
  Controls: 'section',
  ControlButton: 'button',
  useReactFlow: () => ({ getNodes: () => mockNodes, fitView: mockFitView }),
  useStoreApi: () => ({ setState: mockSetState }),
  useStore: (selector: (state: unknown) => unknown) => selector({ nodes: mockNodes, nodesDraggable: mockInteractive, nodesConnectable: mockInteractive, elementsSelectable: mockInteractive }),
}));

beforeEach(() => { mockNodes = []; mockFitView.mockClear(); mockSetState.mockClear(); mockInteractive = true; });

test('bottom-left fit actions exclude the pinned render connector and fit the selected nodes', () => {
  mockNodes = [
    { id: 'first', selected: false },
    { id: 'second', selected: true },
    { id: 'render-output', selected: true },
  ];
  const controls = GraphControls({ snapToGrid: false, onToggleSnap: jest.fn() });
  expect(controls.props.position).toBe('bottom-left');
  controls.props.children[0].props.onClick();
  expect(mockFitView.mock.calls[0][0].nodes.map(node => node.id)).toEqual(['first', 'second']);
  controls.props.children[1].props.onClick();
  expect(mockFitView.mock.calls[1][0].nodes.map(node => node.id)).toEqual(['second']);
});

test('fit selection is disabled without an editable selection and an empty graph is not fitted', () => {
  mockNodes = [{ id: 'render-output', selected: true }];
  const controls = GraphControls({ snapToGrid: false, onToggleSnap: jest.fn() });
  expect(controls.props.children[1].props.disabled).toBe(true);
  controls.props.children[0].props.onClick();
  expect(mockFitView).not.toHaveBeenCalled();
});

test.each([false, true])('magnet button reflects snapping state %s and toggles it', snapToGrid => {
  const onToggleSnap = jest.fn();
  const controls = GraphControls({ snapToGrid, onToggleSnap });
  const magnet = controls.props.children[2];
  expect(magnet.props['aria-pressed']).toBe(snapToGrid);
  expect(magnet.props['aria-label']).toBe('Snap nodes to grid');
  magnet.props.onClick();
  expect(onToggleSnap).toHaveBeenCalledTimes(1);
});

test.each([false, true])('last control reflects interactivity %s and toggles all editing interactions', interactive => {
  mockInteractive = interactive;
  const controls = GraphControls({ snapToGrid: false, onToggleSnap: jest.fn() });
  expect(controls.props.showInteractive).toBe(false);
  const lock = controls.props.children[controls.props.children.length - 1];
  expect(lock.props['aria-label']).toBe('Toggle interactivity');
  expect(lock.props['aria-pressed']).toBe(interactive);
  expect(lock.props.title).toBe(interactive ? 'Lock graph editing' : 'Unlock graph editing');
  lock.props.onClick();
  expect(mockSetState).toHaveBeenCalledWith({ nodesDraggable: !interactive, nodesConnectable: !interactive, elementsSelectable: !interactive });
});

jest.mock('../../../i18n/I18n', () => ({ useTranslation: () => ({ t: jest.requireActual('../../../i18n/translate').translate, locale: 'en' }) }));
