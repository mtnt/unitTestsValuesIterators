import { allValuesTypes, testWithGettersAsync, testWithValues } from '../../src';
import { InvalidParamsError } from '../../src/lib/baseErrors';

describe.only('testWithGettersSync', () => {
  testWithValues(
    (value, type) => {
      it(`should throw an exception if no function passed: ${String(value)} of type ${String(type)}`, async () => {
        // @ts-expect-error
        await expect(testWithGettersAsync(value, [() => 1])).rejects.toThrowError(InvalidParamsError);
      });
    },
    { excludeTypes: [allValuesTypes.FUNCTION] }
  );

  testWithValues(
    (value, type) => {
      it(`should throw an exception if no getters passed: ${String(value)} of type ${String(type)}`, async () => {
        // @ts-expect-error
        await expect(testWithGettersAsync(async () => {}, value)).rejects.toThrowError(InvalidParamsError);
      });
    },
    { excludeTypes: [allValuesTypes.ARRAY, allValuesTypes.PLAIN_OBJECT] }
  );

  it('should get all values from getters array', async () => {
    const spy = jest.fn();

    const values = [1, 'str', true, [1, false, '']];

    await testWithGettersAsync(
      async (getter, key) => {
        spy(await getter(), key);
      },
      values.map(value => async () => value)
    );

    values.forEach((value, idx) => {
      expect(spy).toHaveBeenNthCalledWith(idx + 1, values[idx], `value_${idx}`);
    });
  });

  it('should get all values from sync getters object', async () => {
    const spy = jest.fn();

    const values = { number: 1, string: 'str', bool: true, array: [1, false, ''] };

    await testWithGettersAsync(
      async (getter, key) => {
        spy(await getter(), key);
      },
      Object.entries(values).reduce<Record<PropertyKey, () => Promise<any>>>(
        (obj, [key, value]) => ({ ...obj, [key]: async () => value }),
        {}
      )
    );

    Object.entries(values).forEach(([key, value]) => {
      expect(spy).toHaveBeenCalledWith(value, key);
    });
  });
});
