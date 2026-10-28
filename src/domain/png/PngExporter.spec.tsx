import { PngExporter } from './PngExporter';
import { downloadFile } from '../../utils/Download';

jest.mock('../../ui/AnimatedButton', () => ({ AnimatedButton: () => null }));
jest.mock('../../utils/Download', () => ({ downloadFile: jest.fn() }));

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
const originalImage = Object.getOwnPropertyDescriptor(globalThis, 'Image');
let image: { onload?: () => void; onerror?: () => void; src?: string };
const drawImage = jest.fn();
const blob = new Blob(['png'], { type: 'image/png' });
const canvas = {
  width: 0, height: 0,
  getContext: () => ({ drawImage }),
  toBlob: (callback: BlobCallback) => callback(blob),
};

beforeEach(() => {
  jest.clearAllMocks();
  image = {};
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { createElement: () => canvas } });
  Object.defineProperty(globalThis, 'Image', { configurable: true, value: function () { return image; } });
  jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:drawing');
  jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
  if (originalDocument) Object.defineProperty(globalThis, 'document', originalDocument);
  else Reflect.deleteProperty(globalThis, 'document');
  if (originalImage) Object.defineProperty(globalThis, 'Image', originalImage);
  else Reflect.deleteProperty(globalThis, 'Image');
});

test('exports only on click and uses the current drawing and requested dimensions', () => {
  const getData = jest.fn(() => ({ name: 'Drawing', svg: '<svg/>', dimensions: { width: 640, height: 480 } }));
  const button = PngExporter({ getData });
  expect(getData).not.toHaveBeenCalled();
  expect(downloadFile).not.toHaveBeenCalled();
  button.props.onClick();
  expect(getData).toHaveBeenCalledTimes(1);
  expect([canvas.width, canvas.height]).toEqual([640, 480]);
  expect(downloadFile).not.toHaveBeenCalled();
  image.onload?.();
  expect(drawImage).toHaveBeenCalledWith(image, 0, 0);
  expect(downloadFile).toHaveBeenCalledWith('Drawing.png', blob);
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:drawing');
});

test('releases the SVG URL if image loading fails', () => {
  PngExporter({ getData: () => ({ name: 'Broken', svg: '', dimensions: { width: 10, height: 10 } }) }).props.onClick();
  image.onerror?.();
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:drawing');
  expect(downloadFile).not.toHaveBeenCalled();
});
