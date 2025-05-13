declare type ValueOf<T extends Record<PropertyKey, any>> = T[keyof T];
