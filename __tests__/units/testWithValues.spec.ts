import { allValuesTypes, testWithValues } from '../../src';
import { valuesMap } from '../../src/constants';
import { InvalidParamsError } from '../../src/lib/baseErrors';

describe('testWithValues', () => {
  it('should call all the types if no options was passed', () => {
    const spy = jest.fn();

    testWithValues(spy);

    Object.entries(valuesMap).forEach(([type, values]) => {
      values.forEach(value => {
        expect(spy).toHaveBeenCalledWith(value, type);
      });
    });
  });

  it('should not call excluded types', () => {
    const spy = jest.fn();

    const excludeTypes: ValueOf<typeof allValuesTypes>[] = [allValuesTypes.BOOLEAN, allValuesTypes.ARRAY];

    testWithValues(spy, { excludeTypes });

    (Object.entries(valuesMap) as Entries<typeof valuesMap>)
      .filter(([type]) => !excludeTypes.includes(type))
      .forEach(([type, values]) => {
        values.forEach(value => {
          expect(spy).toHaveBeenCalledWith(value, type);
        });
      });
    (Object.entries(valuesMap) as Entries<typeof valuesMap>)
      .filter(([type]) => excludeTypes.includes(type))
      .forEach(([type, values]) => {
        values.forEach(value => {
          expect(spy).not.toHaveBeenCalledWith(value, type);
        });
      });
  });

  it('should call the only types', () => {
    const spy = jest.fn();

    const onlyTypes: ValueOf<typeof allValuesTypes>[] = [allValuesTypes.BOOLEAN, allValuesTypes.ARRAY];

    testWithValues(spy, { onlyTypes });

    (Object.entries(valuesMap) as Entries<typeof valuesMap>)
      .filter(([type]) => onlyTypes.includes(type))
      .forEach(([type, values]) => {
        values.forEach(value => {
          expect(spy).toHaveBeenCalledWith(value, type);
        });
      });

    (Object.entries(valuesMap) as Entries<typeof valuesMap>)
      .filter(([type]) => !onlyTypes.includes(type))
      .forEach(([type, values]) => {
        values.forEach(value => {
          expect(spy).not.toHaveBeenCalledWith(value, type);
        });
      });
  });

  it('should not call any types if the only types array is empty', () => {
    const spy = jest.fn();

    const onlyTypes: ValueOf<typeof allValuesTypes>[] = [];

    testWithValues(spy, { onlyTypes });

    expect(spy).toHaveBeenCalledTimes(0);
  });

  it('should throw an exception if no function passed', () => {
    expect(() => {
      // @ts-expect-error
      testWithValues();
    }).toThrowError(InvalidParamsError);
  });

  it('should throw an exception if the exclude and the only types are passed', () => {
    expect(() => {
      // @ts-expect-error
      testWithValues(() => {}, { onlyTypes: [], excludeTypes: [] });
    }).toThrowError(InvalidParamsError);
  });

  it('should call all types and all the values array if passed', () => {
    const spy = jest.fn();

    const useValues = ['string', 123, () => {}];

    testWithValues(spy, { useValues });

    Object.entries(valuesMap).forEach(([type, values]) => {
      values.forEach(value => {
        expect(spy).toHaveBeenCalledWith(value, type);
      });
    });

    useValues.forEach((value, idx) => {
      expect(spy).toHaveBeenCalledWith(value, `value_${idx}`);
    });
  });

  it('should call all types and all the values object if passed', () => {
    const spy = jest.fn();

    const useValues = { string: 'string', number: 123, function: () => {} };

    testWithValues(spy, { useValues });

    Object.entries(valuesMap).forEach(([type, values]) => {
      values.forEach(value => {
        expect(spy).toHaveBeenCalledWith(value, type);
      });
    });

    Object.entries(useValues).forEach(([key, value]) => {
      expect(spy).toHaveBeenCalledWith(value, key);
    });
  });

  it('should call all values from array and no types empty "only" array if passed', () => {
    const spy = jest.fn();

    const useValues = ['string', 123, () => {}];

    testWithValues(spy, { onlyTypes: [], useValues });

    Object.entries(valuesMap).forEach(([type, values]) => {
      values.forEach(value => {
        expect(spy).not.toHaveBeenCalledWith(value, type);
      });
    });

    useValues.forEach((value, idx) => {
      expect(spy).toHaveBeenCalledWith(value, `value_${idx}`);
    });
  });

  it('should call all values from object and no types empty "only" array if passed', () => {
    const spy = jest.fn();

    const useValues = { string: 'string', number: 123, function: () => {} };

    testWithValues(spy, { onlyTypes: [], useValues });

    Object.entries(valuesMap).forEach(([type, values]) => {
      values.forEach(value => {
        expect(spy).not.toHaveBeenCalledWith(value, type);
      });
    });

    Object.entries(useValues).forEach(([key, value]) => {
      expect(spy).toHaveBeenCalledWith(value, key);
    });
  });
});
