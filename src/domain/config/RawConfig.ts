export interface RawConfig {
  meta: { name: string };
  stages: { type: string; data: Record<string, Record<string, string>> }[];
}
