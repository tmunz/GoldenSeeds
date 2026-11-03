import { BehaviorSubject } from 'rxjs';

import { Config } from './Config';
import { RawConfig } from './RawConfig';
import { Graph } from '../graph/model/Graph';
import { GraphLayout } from '../graph/model/GraphLayout';
import { RENDER_NODE_ID } from '../graph/nodes/render/RenderNode';
import { DEFAULT_POSITION } from '../graph/model/GraphLayout';
import { fromRawConfig, toRawConfig } from '../graph/runtime/GraphSerializer';

export type SaveState = 'saved' | 'unsaved';

export class ConfigService {
  config$ = new BehaviorSubject<Config>({ meta: { name: '' }, graph: { nodes: [], edges: [] }, layout: {} });
  saveState$ = new BehaviorSubject<SaveState>('unsaved');
  private savedContent: string | undefined;

  async setRawConfig(rawConfig: RawConfig, { saved = false }: { saved?: boolean } = {}): Promise<void> {
    const config = await fromRawConfig(rawConfig);
    this.savedContent = saved ? this.content(config) : undefined;
    this.publish(config);
  }

  /** Whether leaving the current drawing would lose work; an untouched blank drawing doesn't count. */
  hasUnsavedChanges(): boolean {
    const { meta, graph } = this.config$.value;
    return this.saveState$.value === 'unsaved'
      && (meta.name !== '' || graph.nodes.some(node => node.id !== RENDER_NODE_ID));
  }

  setName(name: string) {
    this.publish({ ...this.config$.value, meta: { name } });
  }

  setGraph(graph: Graph, layout: GraphLayout) {
    this.publish({ ...this.config$.value, graph, layout });
  }

  /** Keep the saved snapshot, even if further edits were made while saving. */
  markSaved(config: Config): void {
    if (config.meta.name !== this.config$.value.meta.name) { return; }
    this.savedContent = this.content(config);
    this.updateSaveState(this.config$.value);
  }

  private publish(config: Config): void {
    this.config$.next(config);
    this.updateSaveState(config);
  }

  private updateSaveState(config: Config): void {
    const state = this.savedContent !== undefined && this.savedContent === this.content(config) ? 'saved' : 'unsaved';
    if (state !== this.saveState$.value) { this.saveState$.next(state); }
  }

  private content(config: Config): string {
    const raw = toRawConfig(config);
    // Missing positions mean origin; the pinned render connector has no editable position.
    const layout = Object.fromEntries(raw.nodes.filter(node => node.id !== RENDER_NODE_ID)
      .map(node => {
        const { x, y } = raw.layout?.[node.id] ?? DEFAULT_POSITION;
        return [node.id, { x, y }];
      }));
    const edges = raw.edges.map(edge => ({
      id: edge.id,
      from: { nodeId: edge.from.nodeId, port: edge.from.port },
      to: { nodeId: edge.to.nodeId, port: edge.to.port },
    }));
    return JSON.stringify({ ...raw, edges, layout });
  }
}

export const configService = new ConfigService();
