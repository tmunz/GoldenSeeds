import { PortDefinition, PortValue } from './PortValue';

export interface GraphNode<T = unknown> {
  id: string;
  kind: string;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  config: T;
  evaluate(inputs: Record<string, PortValue | undefined>): Record<string, PortValue>;
}
