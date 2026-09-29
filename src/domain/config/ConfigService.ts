import { BehaviorSubject } from 'rxjs';

import { Config } from './Config';
import { RawConfig } from './RawConfig';
import { Graph } from '../graph/Graph';
import { GraphLayout } from '../graph/GraphLayout';
import { fromRawConfig, toRawConfig } from '../graph/GraphSerializer';

export class ConfigService {
  config$ = new BehaviorSubject<Config>({ meta: { name: '' }, graph: { nodes: [], edges: [] }, layout: {} });

  async setRawConfig(rawConfig: RawConfig): Promise<void> {
    this.config$.next(await fromRawConfig(rawConfig));
  }

  setName(name: string) {
    this.config$.next({ ...this.config$.value, meta: { name } });
  }

  /** Persists the graph/layout after an edit in GraphCanvas (see GraphCanvas's onGraphChange). */
  setGraph(graph: Graph, layout: GraphLayout) {
    this.config$.next({ ...this.config$.value, graph, layout });
  }

  static toRawConfig(config: Config): RawConfig {
    return toRawConfig(config);
  }
}

export const configService = new ConfigService();

