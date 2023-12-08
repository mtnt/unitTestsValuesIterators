import { isNil, isFunction, difference, isPlainObject, get } from 'lodash';

import { allValuesTypes, valuesMap } from './constants';
import { InvalidParamsError } from './lib/baseErrors';

export { allValuesTypes };

type ValueOf<T extends Record<PropertyKey, any>> = T[keyof T];

type StandardValues<
  O extends ValueOf<typeof allValuesTypes>[] | undefined,
  E extends ValueOf<typeof allValuesTypes>[] | undefined,
> = O extends undefined
  ? E extends undefined
    ? ValueOf<typeof valuesMap>[number]
    : ValueOf<Omit<typeof valuesMap, NonNullable<E>[number]>>[number]
  : O extends never[]
  ? never
  : ValueOf<Pick<typeof valuesMap, NonNullable<O>[number]>>[number];

export type AllValues = ValueOf<typeof valuesMap>[number];

export function testWithValues<
  O extends ValueOf<typeof allValuesTypes>[] | undefined = undefined,
  E extends ValueOf<typeof allValuesTypes>[] | undefined = undefined,
  V extends any[] | Record<PropertyKey, any> | undefined = undefined,
>(
  func: (
    value:
      | StandardValues<O, E>
      | (V extends undefined ? never : V extends readonly any[] ? NonNullable<V>[number] : NonNullable<V>[keyof V]),
    type: PropertyKey
  ) => any,
  {
    onlyTypes: onlyTypesOuter,
    excludeTypes: excludeTypesOuter,
    useValues: useValuesOuter,
  }: {
    onlyTypes?: E extends undefined ? O : never;
    excludeTypes?: O extends undefined ? E : never;
    useValues?: V;
  } = {}
) {
  if (!isFunction(func)) {
    throw new InvalidParamsError('There is no function to call');
  }

  if (!isNil(excludeTypesOuter) && !isNil(onlyTypesOuter)) {
    throw new InvalidParamsError('TestValues got both of `exclude` and `only` arrays');
  }

  const standardKeysToUse = !isNil(onlyTypesOuter)
    ? (onlyTypesOuter as NonNullable<typeof onlyTypesOuter>)
    : !isNil(excludeTypesOuter)
    ? (difference(Object.keys(valuesMap), excludeTypesOuter) as Extract<
        ValueOf<typeof allValuesTypes>,
        NonNullable<typeof excludeTypesOuter>
      >[])
    : Object.values(allValuesTypes);

  standardKeysToUse.forEach(key => {
    const values = valuesMap[key];

    values.forEach(value => {
      func(value, key);
    });
  });

  if (Array.isArray(useValuesOuter)) {
    useValuesOuter.forEach((value, idx) => {
      func(value, `value_${idx}`);
    });
  } else if (!isNil(useValuesOuter)) {
    Object.entries(useValuesOuter).forEach(([key, value]) => {
      func(value, key);
    });
  }
}

export function testWithGettersSync<G extends Function[] | Record<PropertyKey, Function>>(
  func: (getter: G extends readonly any[] ? G[number] : ValueOf<G>, type: PropertyKey) => any,
  getters: G
) {
  if (!isFunction(func)) {
    throw new InvalidParamsError('There is no function to call');
  }
  if (!Array.isArray(getters) && !isPlainObject(getters)) {
    throw new InvalidParamsError('There is no getters to iterate');
  }

  if (Array.isArray(getters)) {
    getters.forEach((getter, idx) => {
      func(getter, `value_${idx}`);
    });
  } else {
    Object.entries(getters).forEach(([key, getter]) => {
      func(getter, key);
    });
  }
}

type PromiseFunc = (...args: any[]) => Promise<any>;
function isPromiseFunc(value: any): value is (...args: any[]) => Promise<any> {
  return isFunction(value);
}
export async function testWithGettersAsync<G extends PromiseFunc[] | Record<PropertyKey, PromiseFunc>>(
  func: (getter: G extends readonly any[] ? G[number] : ValueOf<G>, key: PropertyKey) => Promise<any>,
  getters: G
) {
  if (!isPromiseFunc(func)) {
    throw new InvalidParamsError('There is no function to call');
  }
  if (!Array.isArray(getters) && !isPlainObject(getters)) {
    throw new InvalidParamsError('There is no getters to iterate');
  }

  if (Array.isArray(getters)) {
    for (let idx = 0; idx < getters.length; idx++) {
      await func(getters[idx], `value_${idx}`);
    }
  } else {
    const entries = Object.entries(getters);

    for (let idx = 0; idx < entries.length; idx++) {
      await func(entries[idx][1], entries[idx][0]);
    }
  }
}

export function stringify(value: any): string {
  return typeof value === 'symbol' ? String(value) : JSON.stringify(value);
}
