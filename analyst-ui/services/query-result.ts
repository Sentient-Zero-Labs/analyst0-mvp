export type QueryResult<T> = {
  data: T | undefined;
  isLoading: boolean;
};
