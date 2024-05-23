import { wait } from './wait.js'

export async function runWithRetry<T>(
  fn: () => Promise<T>,
  {
    retries = 3,
    retryDelay = 1000
  }: {
    retries?: number
    retryDelay?: number
  } = {}
): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    if (retries <= 0) {
      throw err
    }
    console.error(err)
    console.log('Retrying...')
    await wait(retryDelay)
    return runWithRetry(fn, {
      retries: retries - 1
    })
  }
}
