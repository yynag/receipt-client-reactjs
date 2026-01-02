export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<unknown> ? T[P] : T[P] extends Record<string, unknown> ? DeepPartial<T[P]> : T[P];
};

export type PartialRecord<K extends PropertyKey, V> = {
  [P in K]?: V;
};
