import {omit, forEach, isNil, isEmpty, isArray, isFunction, difference, keys} from 'lodash';

import {InvalidParamsError} from './lib/baseErrors';


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
};

const valuesMap = {
    [allValuesTypes.STRING]: ['foo', '', '0', 'false', 'true'],
    [allValuesTypes.NUMBER]: [-1, 0, 1],
    [allValuesTypes.INFINITY]: [Infinity, -Infinity],
    [allValuesTypes.BOOLEAN]: [true, false],
    [allValuesTypes.ARRAY]: [[], [1, 2, 'foo']],
    [allValuesTypes.PLAIN_OBJECT]: [{}, {foo: 'bar', bar: 'foo'}],
    [allValuesTypes.FUNCTION]: [function () {}],
    [allValuesTypes.UNDEFINED]: [undefined],
    [allValuesTypes.NULL]: [null],
};

export function testAllValues(func, {exclude, only} = {}) {
    if (!isFunction(func)) {
        throw new InvalidParamsError('There is no function to call');
    }

    if (!isNil(exclude) && !isNil(only)) {
        throw new InvalidParamsError('TestAllValues got both of `exclude` and `only` arrays');
    }

    if (!isNil(only)) {
        exclude = difference(keys(valuesMap), only);
    } else {
        exclude = exclude || [];
    }

    const values = omit(valuesMap, exclude);

    forEach(values, (value, type) => {
        for (const value of values[type]) {
            func(value, type);
        }
    });
}

export function testValues(func, values) {
    if (!isArray(values) || isEmpty(values)) {
        throw new InvalidParamsError('Invalid values');
    }

    for (let value of values) {
        func(value);
    }
}
