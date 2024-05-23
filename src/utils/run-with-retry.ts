import { wait } from './wait.js'
import debug from 'debug'

const log = debug('app:run-with-retry')

export async function runWithRetry<T>(
  fn: () => Promise<T>,
  {
    retries = 3,
    retryDelay = 1000,
    timeout = 60 * 1000,
    timeoutFn = () => {
      throw new Error('Timeout')
    }
  }: {
    retries?: number
    retryDelay?: number
    timeout?: number
    timeoutFn?: () => Promise<never> | never
  } = {}
): Promise<T> {
  try {
    return await Promise.race([fn(), wait(timeout).then(timeoutFn)])
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
