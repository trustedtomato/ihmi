import { wait } from './wait.js'
import debug from 'debug'

const log = debug('app:run-with-retry')

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
    log(err)
    log('Retrying...')
    await wait(retryDelay)
    return runWithRetry(fn, {
      retries: retries - 1
    })
  }
}
