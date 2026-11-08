import { ConfigManagerUi } from './ConfigManagerUi';
import { configManager, ConfigItem } from './ConfigManager';
import { configService } from './ConfigService';
import { preconfigs } from './data';
import { dialogService } from '../../ui/DialogService';

jest.mock('react', () => ({ ...jest.requireActual('react'), useState: (initial: unknown) => [initial, jest.fn()] }));
jest.mock('./ConfigManagerUi.css', () => ({}));
jest.mock('../../ui/AnimatedButton', () => ({ AnimatedButton: () => null }));
jest.mock('./data', () => ({ preconfigs: [{ meta: { name: 'Drawing' }, nodes: [], edges: [] }] }));

let item: ConfigItem;
beforeEach(async () => {
  await configService.setRawConfig(preconfigs[0]);
  item = { name: 'Drawing', rawConfig: preconfigs[0], preconfig: true, sortIndex: 0, svg: null };
});
afterEach(() => jest.restoreAllMocks());

function actions(savedItem = item, hasChanges = true) {
  const ui = ConfigManagerUi({ configItems: [savedItem], activeConfig: configService.config$.value, hasChanges });
  return ui.props.children[0].props.children.filter(Boolean);
}

test('saving a modified preset keeps the user version and marks it saved after success', async () => {
  const save = jest.spyOn(configManager, 'save').mockResolvedValue({ ...item, preconfig: false });
  const select = jest.spyOn(configManager, 'select').mockResolvedValue();
  actions().find((button: { props: { title: string } }) => button.props.title === 'save').props.onClick();
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(save).toHaveBeenCalledWith(expect.objectContaining({ meta: { name: 'Drawing' } }), 0);
  expect(configService.saveState$.value).toBe('saved');
  expect(select).toHaveBeenCalledWith('Drawing', { reload: false });
});

test('failed saves leave the drawing unsaved and do not select another drawing', async () => {
  jest.spyOn(configManager, 'save').mockRejectedValue(new Error('Storage full'));
  const select = jest.spyOn(configManager, 'select').mockResolvedValue();
  actions().find((button: { props: { title: string } }) => button.props.title === 'save').props.onClick();
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(configService.saveState$.value).toBe('unsaved');
  expect(select).not.toHaveBeenCalled();
});

test('a saved user version of a preset still offers reset to the original', () => {
  const buttons = actions({ ...item, preconfig: false }, false);
  expect(buttons.some((button: { props: { title: string } }) => button.props.title === 'reset')).toBe(true);
  expect(buttons.find((button: { props: { title: string } }) => button.props.title === 'reload').props.disabled).toBe(true);
});

test.each([false, true])('reload waits for the styled confirmation and respects response %s', async accepted => {
  const select = jest.spyOn(configManager, 'select').mockResolvedValue();
  const reload = actions().find((button: { props: { title: string } }) => button.props.title === 'reload');
  const pending = reload.props.onClick();
  expect(select).not.toHaveBeenCalled();
  const request = dialogService.current()!;
  expect(request.kind).toBe('confirm');
  expect(request.title).toBe('Unsaved changes');
  dialogService.respond(request, accepted);
  await pending;
  expect(select).toHaveBeenCalledTimes(accepted ? 1 : 0);
});

jest.mock('../../i18n/I18n', () => ({ useTranslation: () => ({ t: jest.requireActual('../../i18n/translate').translate, locale: 'en' }) }));
