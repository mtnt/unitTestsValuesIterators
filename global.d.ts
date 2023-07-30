declare type ValueOf<T extends Record<string | number, any>> = T[keyof T];
