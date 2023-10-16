import { valuesMap, allValuesTypes } from '../../src/constants';
import { InvalidParamsError } from '../../src/lib/baseErrors';
import { testValuesSync } from '../../src';

describe('testValuesSync', () => {
  it('should call all the types if no options was passed', () => {
    const spy = jest.fn();

    testValuesSync(spy);

    Object.entries(valuesMap).forEach(([type, values]) => {
      values.forEach(value => {
        expect(spy).toHaveBeenCalledWith(value, type);
      });
    });
  });

  it('should not call excluded types', () => {
    const spy = jest.fn();

    const excludeTypes: ValueOf<typeof allValuesTypes>[] = [allValuesTypes.BOOLEAN, allValuesTypes.ARRAY];

    testValuesSync(spy, { excludeTypes });

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

    testValuesSync(spy, { onlyTypes });

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

    testValuesSync(spy, { onlyTypes });

    expect(spy).toHaveBeenCalledTimes(0);
  });

  it('should throw an exception if the exclude and the only types are passed', () => {
    expect(() => {
      // @ts-expect-error
      testValuesSync(() => {}, { onlyTypes: [], excludeTypes: [] });
    }).toThrowError(InvalidParamsError);
  });

  it('should call all types and all the values if passed', () => {
    const spy = jest.fn();

    const useValues = ['string', 123, () => {}];

    testValuesSync(spy, { useValues });

    Object.entries(valuesMap).forEach(([type, values]) => {
      values.forEach(value => {
        expect(spy).toHaveBeenCalledWith(value, type);
      });
    });

    useValues.forEach((value, idx) => {
      expect(spy).toHaveBeenCalledWith(value, `value_${idx}`);
    });
  });

  it('should call all values and no types empty "only" array if passed', () => {
    const spy = jest.fn();

    const useValues = ['string', 123, () => {}];

    testValuesSync(spy, { onlyTypes: [], useValues });

    Object.entries(valuesMap).forEach(([type, values]) => {
      values.forEach(value => {
        expect(spy).not.toHaveBeenCalledWith(value, type);
      });
    });

    useValues.forEach((value, idx) => {
      expect(spy).toHaveBeenCalledWith(value, `value_${idx}`);
    });
  });

  it('should call all types and all the getters if passed', () => {
    const spy = jest.fn();

    const values = {
      customKey0: 'string',
      customKey1: 123,
      customKey2: () => {},
    };
    const useGetters = {
      customKey0: () => values['customKey0'],
      customKey1: () => values['customKey1'],
      customKey2: () => values['customKey2'],
    };

    testValuesSync(spy, { useGetters });

    Object.entries(valuesMap).forEach(([type, values]) => {
      values.forEach(value => {
        expect(spy).toHaveBeenCalledWith(value, type);
      });
    });

    Object.entries(useGetters).forEach(([type, getter]) => {
      expect(spy).toHaveBeenCalledWith(getter(), type);
    });
  });

  it('should call all getters and no types empty "only" array if passed', () => {
    const spy = jest.fn();

    const values = {
      customKey0: 'string',
      customKey1: 123,
      customKey2: () => {},
    };
    const useGetters = {
      customKey0: () => values['customKey0'],
      customKey1: () => values['customKey1'],
      customKey2: () => values['customKey2'],
    };

    testValuesSync(spy, { onlyTypes: [], useGetters });

    Object.entries(valuesMap).forEach(([type, values]) => {
      values.forEach(value => {
        expect(spy).not.toHaveBeenCalledWith(value, type);
      });
    });

    Object.entries(useGetters).forEach(([type, getter]) => {
      expect(spy).toHaveBeenCalledWith(getter(), type);
    });
  });

  it('should call all values and all the getters and all types', () => {
    const spy = jest.fn();

    const useValues = ['string', 123, () => {}];
    const useGetters = {
      customKey0: () => useValues[0],
      customKey1: () => useValues[1],
      customKey2: () => useValues[2],
    };

    testValuesSync(spy, { useValues, useGetters });

    Object.entries(valuesMap).forEach(([type, values]) => {
      values.forEach(value => {
        expect(spy).toHaveBeenCalledWith(value, type);
      });
    });

    useValues.forEach((value, idx) => {
      expect(spy).toHaveBeenCalledWith(value, `value_${idx}`);
    });

    Object.entries(useGetters).forEach(([type, getter]) => {
      expect(spy).toHaveBeenCalledWith(getter(), type);
    });
  });

  it('should call all values and all the getters and no types', () => {
    const spy = jest.fn();

    const useValues = ['string', 123, () => {}];
    const useGetters = {
      customKey0: () => useValues[0],
      customKey1: () => useValues[1],
      customKey2: () => useValues[2],
    };

    testValuesSync(spy, { onlyTypes: [], useValues, useGetters });

    Object.entries(valuesMap).forEach(([type, values]) => {
      values.forEach(value => {
        expect(spy).not.toHaveBeenCalledWith(value, type);
      });
    });

    useValues.forEach((value, idx) => {
      expect(spy).toHaveBeenCalledWith(value, `value_${idx}`);
    });

    Object.entries(useGetters).forEach(([type, getter]) => {
      expect(spy).toHaveBeenCalledWith(getter(), type);
    });
  });
});
