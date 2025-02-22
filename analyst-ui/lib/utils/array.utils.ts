export const isArrayEmpty = <T>(array?: T[]) => {
  return !array || array.length === 0;
};

export const isArrayNotEmpty = <T>(array?: T[] | null) => {
  return array && array.length > 0;
};
