import debug from 'debug'
export const isTestDebugEnabled = debug.enabled('app:test:*')
export const logLine = (...lines: any[]) => {
  if (isTestDebugEnabled) {
    console.log(...lines)
  }
}
export const logWrite = (str: string) => {
  if (isTestDebugEnabled) {
    process.stdout.write(str)
  }
}
