export function cartesianProduct<V extends any[]>(...arrays: V[]): V[number][][] {
  return arrays.reduce<V[number][]>(
    (cartesianPart, array) =>
      cartesianPart.flatMap(cartesianPartTuple => array.map(elem => [...cartesianPartTuple, elem])),
    [[]]
  );
}

export function cartesianProductMap<V extends Record<string, any[]>>(
  source: V
): { [Key in keyof V]: V[Key][number] }[] {
  const singleKeyValueObjects = Object.entries(source).map(([key, values]) =>
    values.map(value => ({ [key]: value }))
  ) as { [Key in keyof V]: V[Key][number] }[][];

  return cartesianProduct(...singleKeyValueObjects).map(([first, ...rest]) => Object.assign({ ...first }, ...rest));
}
