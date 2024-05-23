import { wait } from './wait.js'
import debug from 'debug'

const log = debug('app:run-with-retry')

type ReturnValue<T> =
  | {
      value: T
      timeout: false
    }
  | {
      value: null
      timeout: true
    }

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
    const result = await Promise.race([
      fn().then((value): ReturnValue<T> => {
        return { value, timeout: false }
      }),
      wait(timeout).then((): ReturnValue<T> => {
        return { value: null, timeout: true }
      })
    ])
    if (result.timeout) {
      return await timeoutFn()
    }
    return result.value
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
