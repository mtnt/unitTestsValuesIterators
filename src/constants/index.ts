export const allValuesTypes = {
  STRING: 'string',
  NUMBER_STRING: 'number string',
  BOOLEAN_STRING: 'bool string',
  NUMBER: 'number',
  INFINITY: 'infinity',
  BOOLEAN: 'boolean',
  ARRAY: 'array',
  PLAIN_OBJECT: 'plain object',
  FUNCTION: 'function',
  UNDEFINED: 'undefined',
  NULL: 'null',
  SYMBOL: 'symbol',
} as const;

export const valuesMap = {
  [allValuesTypes.STRING]: ['foo', ''],
  [allValuesTypes.NUMBER_STRING]: ['-10', '2', '10'],
  [allValuesTypes.BOOLEAN_STRING]: ['true', 'false', '1', '0'],
  [allValuesTypes.NUMBER]: [-1, 0, 1],
  [allValuesTypes.INFINITY]: [Infinity, -Infinity],
  [allValuesTypes.BOOLEAN]: [true, false],
  [allValuesTypes.ARRAY]: [[], [1, 2, 'foo']],
  [allValuesTypes.PLAIN_OBJECT]: [{}, { foo: 'bar', bar: 'foo' }],
  [allValuesTypes.FUNCTION]: [function () {}],
  [allValuesTypes.UNDEFINED]: [undefined],
  [allValuesTypes.NULL]: [null],
  [allValuesTypes.SYMBOL]: [Symbol('testLocalSymbol'), Symbol.for('testGlobalSymbol')],
};
