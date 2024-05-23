export const isDebug = !!process.env.DEBUG
export const logLine = (...lines: any[]) => {
  if (isDebug) {
    console.log(...lines)
  }
}
export const logWrite = (str: string) => {
  if (isDebug) {
    process.stdout.write(str)
  }
}
