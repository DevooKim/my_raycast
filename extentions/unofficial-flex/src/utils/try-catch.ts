type Success<T> = {
  data: T;
  error: null;
};

type Failure<E> = {
  data: null;
  error: E;
};

type Result<T, E = Error> = Success<T> | Failure<E>;

export function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>>;
export function tryCatch<T, E = Error>(fn: () => T): Result<T, E>;

export function tryCatch<T, E = Error>(fn: (() => T) | Promise<T>): Promise<Result<T, E>> | Result<T, E> {
  if (fn instanceof Promise) {
    return fn.then((data) => ({ data, error: null })).catch((error) => ({ data: null, error }));
  }
  try {
    const maybePromiseResult = fn();

    if (maybePromiseResult instanceof Promise) {
      return maybePromiseResult.then((data) => ({ data, error: null })).catch((error) => ({ data: null, error }));
    }

    return { data: maybePromiseResult, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
}
