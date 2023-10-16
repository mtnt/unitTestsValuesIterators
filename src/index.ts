import { isNil, isFunction, difference } from 'lodash';

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

export function testValuesSync<
  O extends ValueOf<typeof allValuesTypes>[] | undefined = undefined,
  E extends ValueOf<typeof allValuesTypes>[] | undefined = undefined,
  V extends any[] | undefined = undefined,
  G extends Record<PropertyKey, () => any> | undefined = undefined,
>(
  func: (
    value:
      | StandardValues<O, E>
      | (V extends undefined ? never : NonNullable<V>[number])
      | (G extends undefined ? never : ReturnType<ValueOf<NonNullable<G>>>),
    type: string
  ) => any,
  {
    onlyTypes: onlyTypesOuter,
    excludeTypes: excludeTypesOuter,
    useValues: useValuesOuter,
    useGetters: useGettersOuter,
  }: {
    onlyTypes?: E extends undefined ? O : never;
    excludeTypes?: O extends undefined ? E : never;
    useValues?: V;
    useGetters?: G;
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

  if (!isNil(useValuesOuter)) {
    useValuesOuter.forEach((value, idx) => {
      func(value, `value_${idx}`);
    });
  }

  if (!isNil(useGettersOuter)) {
    Object.entries(useGettersOuter).forEach(([key, getter]) => {
      func(getter(), key);
    });
  }
}
