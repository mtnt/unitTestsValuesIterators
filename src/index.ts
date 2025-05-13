import { isNil, difference } from 'lodash';

import { allValuesTypes, valuesMap } from './constants';
import { cartesianProductMap } from './lib/utils';

export { allValuesTypes };

export type AllValues = ValueOf<typeof valuesMap>[number];

type OnlyTypesParam = { onlyTypes: ValueOf<typeof allValuesTypes>[]; excludeTypes?: never };
type ExcludeTypesParam = { excludeTypes: ValueOf<typeof allValuesTypes>[]; onlyTypes?: never };
type P<PrevResult, D = Record<string, any[] | undefined | OnlyTypesParam | ExcludeTypesParam>> =
  | D
  | ((prev: PrevResult) => D);
type CallParams<PrevResult, Params extends P<PrevResult>> = Params extends (...args: any) => any
  ? CallParams<PrevResult, ReturnType<Params>>
  : {
      [Key in keyof Params]: Params[Key] extends { onlyTypes: infer O }
        ? O extends ValueOf<typeof allValuesTypes>[]
          ? { value: ValueOf<Pick<typeof valuesMap, NonNullable<O>[number]>>[number]; type: string }
          : never
        : Params[Key] extends { excludeTypes: infer E }
        ? E extends ValueOf<typeof allValuesTypes>[]
          ? { value: ValueOf<Omit<typeof valuesMap, NonNullable<E>[number]>>[number]; type: string }
          : never
        : Params[Key] extends Array<any>
        ? Params[Key][number]
        : never;
    };

export class SequenceCallsBuilder<Result = undefined> {
  private sequence: { parameters: P<any>; call: Function }[] = [];

  private do(idx = 0, prevResult = undefined) {
    let { parameters, call } = this.sequence[idx];

    if (typeof parameters === 'function') {
      parameters = parameters(prevResult);
    }

    const parameters2use = Object.entries(parameters).reduce<Record<string, any[]>>((result, [property, values]) => {
      if (Array.isArray(values)) {
        result[property] = values;
      } else if (!isNil(values)) {
        const { onlyTypes: onlyTypesOuter, excludeTypes: excludeTypesOuter } = values;

        if (!isNil(excludeTypesOuter) === !isNil(onlyTypesOuter)) {
          throw new Error('TestValues got or not both of `exclude` and `only` arrays');
        }

        const standardKeysToUse = !isNil(onlyTypesOuter)
          ? onlyTypesOuter
          : !isNil(excludeTypesOuter)
          ? (difference(Object.keys(valuesMap), excludeTypesOuter) as Exclude<
              keyof typeof valuesMap,
              typeof excludeTypesOuter
            >[])
          : Object.values(allValuesTypes);

        result[property] = standardKeysToUse.reduce<{ value: any; key: string }[]>((result, key) => {
          for (const value of valuesMap[key]) {
            result.push({ value, key });
          }

          return result;
        }, []);
      }

      return result;
    }, {});

    if (Object.keys(parameters2use).length === 0) {
      const result = call({}, prevResult);

      if (idx < this.sequence.length - 1) {
        this.do(idx + 1, result);
      }
    } else {
      for (const parametersCombination of cartesianProductMap(parameters2use)) {
        const result = call(parametersCombination, prevResult);

        if (idx < this.sequence.length - 1) {
          this.do(idx + 1, result);
        }
      }
    }
  }

  add = <NextResult, Params extends P<Result>>(options: {
    parameters: Params;
    call: (params: CallParams<Result, Params>, preconditionResult: Result) => Promise<NextResult> | NextResult;
  }) => {
    this.sequence.push(options);

    // it is much more safer than new Builder<NextResult>(currentState) because of memory leaks reasons
    return this as unknown as SequenceCallsBuilder<NextResult>;
  };

  execute<Params extends P<Result>>(options: {
    call: (options: { parameters: CallParams<Result, Params>; preconditionResult: Result }) => void | Promise<void>;
    parameters?: Params;
  }) {
    this.add({
      call: (parameters, preconditionResult) => {
        options.call({ parameters, preconditionResult });
      },
      parameters: options.parameters || ({} as Params),
    }).do();
  }
}

export function stringify(value: any): string {
  return typeof value === 'symbol' ? String(value) : JSON.stringify(value);
}
