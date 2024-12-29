export interface RawConfigStage {
  type: string;
  data: Record<string, Record<string, string>>;
  id?: string;
  name?: string;
}

export interface RawConfig {
  meta: { name: string };
  stages: RawConfigStage[];
}
