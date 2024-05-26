import { Either } from '@sweet-monads/either'

type Promisable<T> = T | Promise<T>

export async function eitherToPromise<L, R>(
  eitherPromise: Promisable<Either<Promisable<L>, Promisable<R>>>
): Promise<Awaited<R>> {
  const either = await eitherPromise
  return await either.fold(
    (err) => {
      throw err
    },
    (res) => {
      return res
    }
  )
}
