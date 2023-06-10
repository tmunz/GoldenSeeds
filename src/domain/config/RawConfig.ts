export interface RawConfigStage {
  type: string;
  data: Record<string, Record<string, string>>;
}

export interface RawConfig {
  meta: { name: string };
  stages: RawConfigStage[];
}
