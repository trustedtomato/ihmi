import { Either, left, right } from '@sweet-monads/either'

export function asyncChainLeft<L, R, NewL, NewR>(
  either: Either<L, R>,
  fn: (val: L) => Promise<Either<NewL, NewR>>
): Promise<Either<NewL, NewR | R>> {
  if (either.isRight()) {
    return Promise.resolve(right(either.value))
  }
  return fn(either.value)
}
