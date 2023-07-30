import { isNil, isEmpty, isArray, isFunction, difference } from 'lodash';

import { InvalidParamsError } from './lib/baseErrors';

export const allValuesTypes = {
  STRING: 'string',
  NUMBER: 'number',
  INFINITY: 'infinity',
  BOOLEAN: 'boolean',
  ARRAY: 'array',
  PLAIN_OBJECT: 'plain object',
  FUNCTION: 'function',
  UNDEFINED: 'undefined',
  NULL: 'null',
} as const;

const valuesMap = {
  [allValuesTypes.STRING]: ['foo', '', '0', 'false', 'true'],
  [allValuesTypes.NUMBER]: [-1, 0, 1],
  [allValuesTypes.INFINITY]: [Infinity, -Infinity],
  [allValuesTypes.BOOLEAN]: [true, false],
  [allValuesTypes.ARRAY]: [[], [1, 2, 'foo']],
  [allValuesTypes.PLAIN_OBJECT]: [{}, { foo: 'bar', bar: 'foo' }],
  [allValuesTypes.FUNCTION]: [function () {}],
  [allValuesTypes.UNDEFINED]: [undefined],
  [allValuesTypes.NULL]: [null],
} as const;

export function testAllValues(
  func: (value: any, type: string) => any,
  {
    exclude: excludeOuter,
    only: onlyOuter,
  }: { exclude?: ValueOf<typeof allValuesTypes>[]; only?: ValueOf<typeof allValuesTypes>[] } = {}
) {
  if (!isFunction(func)) {
    throw new InvalidParamsError('There is no function to call');
  }

  if (!isNil(excludeOuter) && !isNil(onlyOuter)) {
    throw new InvalidParamsError('TestAllValues got both of `exclude` and `only` arrays');
  }

  const exclude = !isNil(onlyOuter)
    ? (difference(Object.keys(valuesMap), onlyOuter) as ValueOf<typeof allValuesTypes>[])
    : excludeOuter ?? [];

  Object.entries(valuesMap)
    .filter(([type]) => !exclude.includes(type as ValueOf<typeof allValuesTypes>))
    .forEach(([type, values]) => {
      for (const value of values) {
        func(value, type);
      }
    });
}

export function testValues(func: (v: any) => any, values: any[]) {
  if (!isArray(values) || isEmpty(values)) {
    throw new InvalidParamsError('Invalid values');
  }

  for (let value of values) {
    func(value);
  }
}
