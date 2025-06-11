export type LogMeta = Record<string, unknown>;

export interface IMetaParams {
  trace?: string;
  meta?: LogMeta;
  context?: string;
}
