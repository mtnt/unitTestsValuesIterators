declare type ValueOf<T extends Record<PropertyKey, any>> = T[keyof T];

declare type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];
