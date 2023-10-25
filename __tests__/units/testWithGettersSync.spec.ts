import { allValuesTypes, testWithGettersSync, testWithValues } from '../../src';
import { InvalidParamsError } from '../../src/lib/baseErrors';

describe('testWithGettersSync', () => {
  testWithValues(
    (value, type) => {
      it(`should throw an exception if no function passed: ${String(value)} of type ${String(type)}`, () => {
        expect(() => {
          // @ts-expect-error
          testWithGettersSync(value, [() => 1]);
        }).toThrowError(InvalidParamsError);
      });
    },
    { excludeTypes: [allValuesTypes.FUNCTION] }
  );

  testWithValues(
    (value, type) => {
      it(`should throw an exception if no getters passed: ${String(value)} of type ${String(type)}`, () => {
        expect(() => {
          // @ts-expect-error
          testWithGettersSync(() => {}, value);
        }).toThrowError(InvalidParamsError);
      });
    },
    { excludeTypes: [allValuesTypes.ARRAY, allValuesTypes.PLAIN_OBJECT] }
  );

  it('should get all values from getters array', () => {
    const spy = jest.fn();

    const values = [1, 'str', true, [1, false, '']];

    testWithGettersSync(
      (getter, key) => {
        spy(getter(), key);
      },
      values.map(value => () => value)
    );

    values.forEach((value, idx) => {
      expect(spy).toHaveBeenNthCalledWith(idx + 1, values[idx], `value_${idx}`);
    });
  });

  it('should get all values from sync getters object', () => {
    const spy = jest.fn();

    const values = { number: 1, string: 'str', bool: true, array: [1, false, ''] };

    testWithGettersSync(
      (getter, key) => {
        spy(getter(), key);
      },
      Object.entries(values).reduce<Record<PropertyKey, () => any>>(
        (obj, [key, value]) => ({ ...obj, [key]: () => value }),
        {}
      )
    );

    Object.entries(values).forEach(([key, value]) => {
      expect(spy).toHaveBeenCalledWith(value, key);
    });
  });
});
