import { Store, Stream as AbstractStream } from './Store';
import { Config } from '../Config';

export interface AppState {
  config: Config;
  preconfigIndex: number;
  editStageId: number;
}

export type Stream = AbstractStream<AppState>;


export class AppStore extends Store<AppState> {

  private static initialState: AppState = {
    config: null,
    preconfigIndex: 0,
    editStageId: null,
  }

  private constructor() {
    super(AppStore.initialState);
  }

  private static _instance: AppStore;

  static get instance(): AppStore {
    if (!AppStore._instance) {
      AppStore._instance = new AppStore();
    }
    return AppStore._instance;
  }
}

export const appStore = AppStore.instance;


