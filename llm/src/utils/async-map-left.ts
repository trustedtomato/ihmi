import { Either, left, right } from '@sweet-monads/either'

export async function asyncMapLeft<L, R, NewL>(
  this: Either<L, R>,
  fn: (val: L) => Promise<NewL>
): Promise<Either<NewL, R>> {
  if (this.isRight()) {
    return Promise.resolve(right(this.value))
  }
  return fn(this.value).then((v) => left(v))
}
