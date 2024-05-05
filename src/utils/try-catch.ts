import { Either, left, right } from '@sweet-monads/either'

export function tryCatch<T>(fn: () => T): Either<string, T> {
  try {
    return right(fn())
  } catch (error: any) {
    return left(error?.message || error?.toString() || 'An error occurred')
  }
}
